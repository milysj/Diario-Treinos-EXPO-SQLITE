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
import { TipoMedida, Treino, TreinoInput } from '../../Banco/Config';

const GRUPOS_MUSCULARES = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços', 'Abdômen'];

interface FormModalProps {
  visivel: boolean;
  treinoEditando: Treino | null; // null = modo Criar | objeto = modo Editar
  onFechar: () => void;
  onSalvar: (dados: TreinoInput) => Promise<void>;
}

export function FormModal({ visivel, treinoEditando, onFechar, onSalvar }: FormModalProps) {
  const insets = useSafeAreaInsets();
  const [exercicio, setExercicio] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('Peito');
  const [tipoMedida, setTipoMedida] = useState<TipoMedida>('reps');
  const [series, setSeries] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [carga, setCarga] = useState('');
  const [instrucoes, setInstrucoes] = useState('');

  // Preenche o formulário quando abre em modo edição ou limpa no modo criação
  useEffect(() => {
    if (treinoEditando) {
      setExercicio(treinoEditando.EXERCICIO);
      setGrupoMuscular(treinoEditando.GRUPO_MUSCULAR);
      setTipoMedida(treinoEditando.TIPO_MEDIDA || 'reps');
      setSeries(String(treinoEditando.SERIES));
      setRepeticoes(String(treinoEditando.REPETICOES));
      setCarga(String(treinoEditando.CARGA));
      setInstrucoes(treinoEditando.INSTRUCOES || '');
    } else {
      setExercicio('');
      setGrupoMuscular('Peito');
      setTipoMedida('reps');
      setSeries('3');
      setRepeticoes('12');
      setCarga('0');
      setInstrucoes('');
    }
  }, [treinoEditando, visivel]);

  async function handleSalvar() {
    const numSeries = Number(series);
    const numRepeticoes = Number(repeticoes);
    const numCarga = Number(carga.replace(',', '.'));

    if (!exercicio.trim()) {
      Alert.alert('Campo obrigatório', 'Informe o nome do exercício.');
      return;
    }

    if (!Number.isInteger(numSeries) || numSeries <= 0) {
      Alert.alert('Valor inválido', 'Informe um número inteiro válido para as séries.');
      return;
    }

    if (!Number.isInteger(numRepeticoes) || numRepeticoes <= 0) {
      Alert.alert(
        'Valor inválido',
        `Informe um número inteiro válido para ${tipoMedida === 'segundos' ? 'os segundos' : 'as repetições'}.`
      );
      return;
    }

    if (Number.isNaN(numCarga) || numCarga < 0) {
      Alert.alert('Valor inválido', 'Informe uma carga válida (use 0 para peso corporal).');
      return;
    }

    await onSalvar({
      exercicio,
      grupoMuscular,
      series: numSeries,
      repeticoes: numRepeticoes,
      carga: numCarga,
      tipoMedida,
      instrucoes,
    });
  }

  return (
    <Modal visible={visivel} animationType="slide" transparent onRequestClose={onFechar}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={[styles.container, { paddingBottom: Math.max(20, insets.bottom + 12) }]}>
          <Text style={styles.titulo}>
            {treinoEditando ? 'Editar Exercício' : 'Novo Exercício'}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Nome do Exercício</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Prancha Abdominal"
              placeholderTextColor="#64748B"
              value={exercicio}
              onChangeText={setExercicio}
            />

            <Text style={styles.label}>Grupo Muscular</Text>
            <View style={styles.chipsContainer}>
              {GRUPOS_MUSCULARES.map((grupo) => {
                const selecionado = grupoMuscular === grupo;
                return (
                  <TouchableOpacity
                    key={grupo}
                    style={[styles.chip, selecionado && styles.chipSelecionado]}
                    onPress={() => setGrupoMuscular(grupo)}
                  >
                    <Text style={[styles.chipTexto, selecionado && styles.chipTextoSelecionado]}>
                      {grupo}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.label}>Tipo de Medida</Text>
            <View style={styles.linhaNumerica}>
              <TouchableOpacity
                style={[styles.tipoBotao, tipoMedida === 'reps' && styles.chipSelecionado]}
                onPress={() => setTipoMedida('reps')}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    tipoMedida === 'reps' && styles.chipTextoSelecionado,
                  ]}
                >
                  Repetições
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.tipoBotao, tipoMedida === 'segundos' && styles.chipSelecionado]}
                onPress={() => setTipoMedida('segundos')}
              >
                <Text
                  style={[
                    styles.chipTexto,
                    tipoMedida === 'segundos' && styles.chipTextoSelecionado,
                  ]}
                >
                  Segundos (Isometria)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.linhaNumerica}>
              <View style={styles.campoMetade}>
                <Text style={styles.label}>Séries</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder="4"
                  placeholderTextColor="#64748B"
                  value={series}
                  onChangeText={setSeries}
                />
              </View>

              <View style={styles.campoMetade}>
                <Text style={styles.label}>
                  {tipoMedida === 'segundos' ? 'Tempo (segundos)' : 'Repetições'}
                </Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  placeholder={tipoMedida === 'segundos' ? '60' : '10'}
                  placeholderTextColor="#64748B"
                  value={repeticoes}
                  onChangeText={setRepeticoes}
                />
              </View>
            </View>

            <Text style={styles.label}>Carga (kg) — 0 para peso corporal</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor="#64748B"
              value={carga}
              onChangeText={setCarga}
            />

            <Text style={styles.label}>Como fazer o exercício (Instruções)</Text>
            <TextInput
              style={[styles.input, styles.inputMultilinha]}
              placeholder="Descreva a postura e execução correta..."
              placeholderTextColor="#64748B"
              value={instrucoes}
              onChangeText={setInstrucoes}
              multiline
              textAlignVertical="top"
            />
          </ScrollView>

          <View style={styles.rodape}>
            <TouchableOpacity style={styles.botaoCancelar} onPress={onFechar}>
              <Text style={styles.textoCancelar}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoSalvar} onPress={handleSalvar}>
              <Text style={styles.textoSalvar}>
                {treinoEditando ? 'Salvar Alterações' : 'Cadastrar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '90%',
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  titulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#CBD5E1',
    marginBottom: 6,
    marginTop: 10,
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
  inputMultilinha: {
    minHeight: 86,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
  },
  tipoBotao: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
  },
  chipSelecionado: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  chipTexto: {
    color: '#CBD5E1',
    fontSize: 13,
    fontWeight: '600',
  },
  chipTextoSelecionado: {
    color: '#0F172A',
  },
  linhaNumerica: {
    flexDirection: 'row',
    gap: 12,
  },
  campoMetade: {
    flex: 1,
  },
  rodape: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
  },
  botaoCancelar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#334155',
    alignItems: 'center',
  },
  textoCancelar: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 15,
  },
  botaoSalvar: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F97316',
    alignItems: 'center',
  },
  textoSalvar: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 15,
  },
});
