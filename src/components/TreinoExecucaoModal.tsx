import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Treino } from '../../Banco/Config';

interface TreinoExecucaoModalProps {
  treino: Treino | null;
  onFechar: () => void;
  onAdaptarTreino: (
    id: number,
    novasSeries: number,
    novasRepeticoes: number,
    novaCarga: number
  ) => Promise<void>;
}

export function TreinoExecucaoModal({
  treino,
  onFechar,
  onAdaptarTreino,
}: TreinoExecucaoModalProps) {
  const insets = useSafeAreaInsets();
  const [seriesFeitas, setSeriesFeitas] = useState('');
  const [valorFeito, setValorFeito] = useState('');
  const [cargaFeita, setCargaFeita] = useState('');
  const [seriesMarcadas, setSeriesMarcadas] = useState<boolean[]>([]);

  // Inicializa os campos com os valores atuais do exercício
  useEffect(() => {
    if (treino) {
      setSeriesFeitas(String(treino.SERIES));
      setValorFeito(String(treino.REPETICOES));
      setCargaFeita(String(treino.CARGA));
      setSeriesMarcadas(Array.from({ length: treino.SERIES }, () => false));
    }
  }, [treino]);

  if (!treino) {
    return null;
  }

  const treinoAtual = treino;
  const ehSegundos = treinoAtual.TIPO_MEDIDA === 'segundos';
  const unidade = ehSegundos ? 'segundos' : 'repetições';
  const unidadeCurta = ehSegundos ? 'seg' : 'reps';

  // Marca ou desmarca uma série no checklist visual e atualiza a contagem
  function alternarSerie(indice: number) {
    const proximo = seriesMarcadas.map((marcada, i) => (i === indice ? !marcada : marcada));
    setSeriesMarcadas(proximo);

    const totalConcluidas = proximo.filter(Boolean).length;
    if (totalConcluidas > 0) {
      setSeriesFeitas(String(totalConcluidas));
    }
  }

  // Calcula mensagem de adaptação em tempo real conforme o desempenho digitado
  const numSeries = Number(seriesFeitas);
  const numValor = Number(valorFeito);
  const numCarga = Number(cargaFeita.replace(',', '.'));

  function gerarResumoAdaptacao(): { titulo: string; cor: string; detalhe: string } {
    if (
      !Number.isInteger(numSeries) ||
      numSeries <= 0 ||
      !Number.isInteger(numValor) ||
      numValor <= 0 ||
      Number.isNaN(numCarga) ||
      numCarga < 0
    ) {
      return {
        titulo: 'Preencha os números realizados',
        cor: '#94A3B8',
        detalhe: 'Informe quantas séries e quantos ' + unidade + ' você conseguiu fazer.',
      };
    }

    const superou =
      numSeries > treinoAtual.SERIES ||
      numValor > treinoAtual.REPETICOES ||
      numCarga > treinoAtual.CARGA;
    const abaixo =
      numSeries < treinoAtual.SERIES ||
      numValor < treinoAtual.REPETICOES ||
      numCarga < treinoAtual.CARGA;

    if (superou) {
      return {
        titulo: 'Evolução detectada! Meta será aumentada',
        cor: '#10B981',
        detalhe: `Seu novo padrão salvo será ${numSeries}x ${numValor} ${unidadeCurta}${
          numCarga > 0 ? ` com ${numCarga} kg` : ' (peso corporal)'
        }.`,
      };
    }

    if (abaixo) {
      return {
        titulo: 'Treino adaptado ao seu ritmo atual',
        cor: '#F59E0B',
        detalhe: `Para evitar sobrecarga, o app ajustará sua meta para ${numSeries}x ${numValor} ${unidadeCurta}${
          numCarga > 0 ? ` com ${numCarga} kg` : ' (peso corporal)'
        }.`,
      };
    }

    return {
      titulo: 'Meta cumprida com sucesso!',
      cor: '#38BDF8',
      detalhe: `Você completou exatamente a meta de ${numSeries}x ${numValor} ${unidadeCurta}.`,
    };
  }

  const resumoAdaptacao = gerarResumoAdaptacao();

  async function handleConcluir() {
    if (!Number.isInteger(numSeries) || numSeries <= 0) {
      Alert.alert('Valor inválido', 'Informe um número inteiro válido para as séries feitas.');
      return;
    }

    if (!Number.isInteger(numValor) || numValor <= 0) {
      Alert.alert('Valor inválido', `Informe um número inteiro válido para ${unidade}.`);
      return;
    }

    if (Number.isNaN(numCarga) || numCarga < 0) {
      Alert.alert('Valor inválido', 'Informe uma carga válida (use 0 para peso corporal).');
      return;
    }

    await onAdaptarTreino(treinoAtual.ID_TR, numSeries, numValor, numCarga);

    Alert.alert(
      'Treino registrado!',
      `${resumoAdaptacao.titulo}\n\n${resumoAdaptacao.detalhe}`,
      [{ text: 'OK', onPress: onFechar }]
    );
  }

  return (
    <Modal visible={Boolean(treino)} animationType="slide" onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={[
          styles.tela,
          { paddingTop: Math.max(16, insets.top + 8), paddingBottom: Math.max(16, insets.bottom + 8) },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Cabeçalho da tela de treino */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.botaoVoltar} onPress={onFechar}>
            <Text style={styles.textoVoltar}>← Voltar</Text>
          </TouchableOpacity>

          <View style={styles.badge}>
            <Text style={styles.badgeTexto}>{treino.GRUPO_MUSCULAR}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.conteudo} showsVerticalScrollIndicator={false}>
          <Text style={styles.titulo}>{treino.EXERCICIO}</Text>
          <Text style={styles.metaAtualTexto}>
            Meta atual: {treino.SERIES} séries × {treino.REPETICOES} {unidadeCurta}
            {treino.CARGA > 0 ? ` • ${treino.CARGA} kg` : ' • Peso corporal'}
          </Text>

          {/* Bloco 1: Como fazer o exercício */}
          <View style={styles.bloco}>
            <Text style={styles.blocoTitulo}>Como fazer o exercício</Text>
            <Text style={styles.instrucoesTexto}>
              {treino.INSTRUCOES?.trim()
                ? treino.INSTRUCOES
                : 'Execute o movimento de forma controlada, mantendo a postura alinhada e respiração constante.'}
            </Text>
          </View>

          {/* Bloco 2: Checklist interativo das séries */}
          <View style={styles.bloco}>
            <Text style={styles.blocoTitulo}>Acompanhar séries feitas</Text>
            <Text style={styles.blocoSubtitulo}>
              Toque em cada série conforme for concluindo:
            </Text>

            <View style={styles.seriesRow}>
              {seriesMarcadas.map((marcada, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.serieCirculo, marcada && styles.serieMarcada]}
                  onPress={() => alternarSerie(index)}
                >
                  <Text style={[styles.serieTexto, marcada && styles.serieTextoMarcado]}>
                    {marcada ? '✓' : `${index + 1}ª`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Bloco 3: Registro real + Adaptação automática */}
          <View style={styles.bloco}>
            <Text style={styles.blocoTitulo}>Quanto você conseguiu fazer?</Text>
            <Text style={styles.blocoSubtitulo}>
              Informe o resultado real do treino de hoje — o app adapta o plano automaticamente no SQLite.
            </Text>

            <View style={styles.linhaInputs}>
              <View style={styles.campo}>
                <Text style={styles.label}>Séries feitas</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={seriesFeitas}
                  onChangeText={setSeriesFeitas}
                  placeholder={String(treino.SERIES)}
                  placeholderTextColor="#64748B"
                />
              </View>

              <View style={styles.campo}>
                <Text style={styles.label}>
                  {ehSegundos ? 'Segundos conseguidos' : 'Repetições conseguidas'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={valorFeito}
                  onChangeText={setValorFeito}
                  placeholder={String(treino.REPETICOES)}
                  placeholderTextColor="#64748B"
                />
              </View>
            </View>

            <Text style={styles.label}>Carga utilizada (kg) — 0 para corporal</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={cargaFeita}
              onChangeText={setCargaFeita}
              placeholder={String(treino.CARGA)}
              placeholderTextColor="#64748B"
            />

            {/* Prévia da adaptação */}
            <View style={[styles.alertaAdaptacao, { borderColor: resumoAdaptacao.cor }]}>
              <Text style={[styles.alertaTitulo, { color: resumoAdaptacao.cor }]}>
                {resumoAdaptacao.titulo}
              </Text>
              <Text style={styles.alertaTexto}>{resumoAdaptacao.detalhe}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Botão fixo para salvar e adaptar */}
        <View style={styles.rodape}>
          <TouchableOpacity style={styles.botaoConcluir} onPress={handleConcluir}>
            <Text style={styles.textoConcluir}>Concluir Treino e Adaptar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  botaoVoltar: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
  },
  textoVoltar: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F9731622',
    borderWidth: 1,
    borderColor: '#F97316',
  },
  badgeTexto: {
    color: '#FB923C',
    fontSize: 12,
    fontWeight: '700',
  },
  conteudo: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  titulo: {
    fontSize: 26,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  metaAtualTexto: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '600',
    marginBottom: 18,
  },
  bloco: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  blocoTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 6,
  },
  blocoSubtitulo: {
    fontSize: 13,
    color: '#94A3B8',
    marginBottom: 12,
    lineHeight: 18,
  },
  instrucoesTexto: {
    fontSize: 14,
    color: '#CBD5E1',
    lineHeight: 22,
  },
  seriesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serieCirculo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0F172A',
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serieMarcada: {
    backgroundColor: '#10B981',
    borderColor: '#10B981',
  },
  serieTexto: {
    color: '#CBD5E1',
    fontWeight: '700',
    fontSize: 14,
  },
  serieTextoMarcado: {
    color: '#0F172A',
    fontSize: 18,
  },
  linhaInputs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  campo: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 11,
    color: '#F8FAFC',
    fontSize: 15,
  },
  alertaAdaptacao: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
  },
  alertaTitulo: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertaTexto: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  rodape: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  botaoConcluir: {
    backgroundColor: '#F97316',
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: 'center',
  },
  textoConcluir: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 16,
  },
});
