import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import {
  adaptarTreinoPosExecucao,
  Banco,
  createTable,
  deleteTreino,
  insertTreino,
  seedTreinos,
  selectTreinosPaginado,
  updateTreino,
} from './Banco/Config';
import { FormModal } from './src/components/FormModal';
import { PaginationBar } from './src/components/PaginationBar';
import { TreinoCard } from './src/components/TreinoCard';
import { TreinoExecucaoModal } from './src/components/TreinoExecucaoModal';

// Quantidade de registros exibidos por página
const ITENS_POR_PAGINA = 5;

export default function App() {
  // Estados principais da tela
  const [db, setDb] = useState(null);
  const [treinos, setTreinos] = useState([]);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalRegistros, setTotalRegistros] = useState(0);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Controla se os botões Editar / Excluir aparecem nos cards (ativado pelo pincel ✎)
  const [modoEdicao, setModoEdicao] = useState(false);

  // Estados do modal de formulário (Criar / Editar) e da tela de execução do treino
  const [modalVisivel, setModalVisivel] = useState(false);
  const [treinoEditando, setTreinoEditando] = useState(null);
  const [treinoExecutando, setTreinoExecutando] = useState(null);

  // 1. Inicializa o banco SQLite, cria/migra tabela e insere os 12 treinos iniciais
  useEffect(() => {
    async function iniciarBanco() {
      try {
        const conexao = await Banco();
        await createTable(conexao);
        await seedTreinos(conexao);
        setDb(conexao);
      } catch (erro) {
        console.log('Erro ao iniciar banco:', erro);
        Alert.alert('Erro', 'Não foi possível inicializar o banco de dados.');
      }
    }

    iniciarBanco();
  }, []);

  // 2. Carrega a página atual sempre que o banco, a página ou a busca mudar
  useEffect(() => {
    if (!db) return;
    carregarTreinos(db, paginaAtual, busca);
  }, [db, paginaAtual, busca]);

  async function carregarTreinos(conexao, pagina, termoBusca) {
    try {
      setCarregando(true);
      const resultado = await selectTreinosPaginado(
        conexao,
        pagina,
        ITENS_POR_PAGINA,
        termoBusca
      );

      // Se a página atual ficou maior que o total (ex: excluiu o último item da página)
      if (pagina > resultado.totalPaginas) {
        setPaginaAtual(resultado.totalPaginas);
        return;
      }

      setTreinos(resultado.itens);
      setTotalRegistros(resultado.totalRegistros);
      setTotalPaginas(resultado.totalPaginas);
    } catch (erro) {
      console.log('Erro ao carregar treinos:', erro);
    } finally {
      setCarregando(false);
    }
  }

  // 3. Abrir modal para CRIAR um novo exercício
  function abrirModalCriar() {
    setTreinoEditando(null);
    setModalVisivel(true);
  }

  // 4. Abrir modal para EDITAR um exercício existente
  function abrirModalEditar(treino) {
    setTreinoEditando(treino);
    setModalVisivel(true);
  }

  // 5. Abrir tela de execução do exercício ao tocar no card
  function abrirExecucaoTreino(treino) {
    setTreinoExecutando(treino);
  }

  // 6. Salvar (CREATE ou UPDATE)
  async function handleSalvar(dados) {
    if (!db) return;

    try {
      if (treinoEditando) {
        await updateTreino(db, treinoEditando.ID_TR, dados);
      } else {
        await insertTreino(db, dados);
        setPaginaAtual(1);
      }

      setModalVisivel(false);
      setTreinoEditando(null);
      await carregarTreinos(db, treinoEditando ? paginaAtual : 1, busca);
    } catch (erro) {
      console.log('Erro ao salvar treino:', erro);
      Alert.alert('Erro', 'Não foi possível salvar o exercício.');
    }
  }

  // 7. Adaptar treino automaticamente após o usuário registrar o que conseguiu fazer
  async function handleAdaptarTreino(id, novasSeries, novasRepeticoes, novaCarga) {
    if (!db) return;
    await adaptarTreinoPosExecucao(db, id, novasSeries, novasRepeticoes, novaCarga);
    await carregarTreinos(db, paginaAtual, busca);
  }

  // 8. Excluir (DELETE) com diálogo de confirmação
  function handleExcluir(treino) {
    Alert.alert(
      'Excluir Exercício',
      `Deseja realmente excluir "${treino.EXERCICIO}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            if (!db) return;
            await deleteTreino(db, treino.ID_TR);
            await carregarTreinos(db, paginaAtual, busca);
          },
        },
      ]
    );
  }

  // Atualiza busca e sempre reinicia na página 1
  function handleBusca(texto) {
    setBusca(texto);
    setPaginaAtual(1);
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <StatusBar style="light" />

        {/* Cabeçalho */}
        <View style={styles.header}>
          <View>
            <Text style={styles.subtitulo}>CRUD • Expo SQLite</Text>
            <Text style={styles.titulo}>Diário de Treinos</Text>
          </View>

          <View style={styles.headerAcoes}>
            {/* Botão pincel de edição: mostra/oculta Editar e Excluir nos cards */}
            <TouchableOpacity
              style={[styles.botaoPincel, modoEdicao && styles.botaoPincelAtivo]}
              onPress={() => setModoEdicao((atual) => !atual)}
              accessibilityLabel="Alternar modo de edição"
            >
              <Text style={[styles.textoPincel, modoEdicao && styles.textoPincelAtivo]}>
                ✎
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.botaoNovo} onPress={abrirModalCriar}>
              <Text style={styles.textoBotaoNovo}>+ Novo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Aviso quando o modo edição está ligado */}
        {modoEdicao && (
          <View style={styles.bannerEdicao}>
            <Text style={styles.bannerEdicaoTexto}>
              Modo edição ativo — toque em Editar ou Excluir nos cards
            </Text>
          </View>
        )}

        {/* Resumo + Barra de Busca */}
        <View style={styles.topoControle}>
          <View style={styles.resumoRow}>
            <Text style={styles.resumoTexto}>
              {totalRegistros} {totalRegistros === 1 ? 'exercício cadastrado' : 'exercícios cadastrados'}
            </Text>
            <Text style={styles.resumoPagina}>{ITENS_POR_PAGINA} por página</Text>
          </View>

          <TextInput
            style={styles.inputBusca}
            placeholder="Buscar por exercício ou grupo muscular..."
            placeholderTextColor="#64748B"
            value={busca}
            onChangeText={handleBusca}
          />
        </View>

        {/* Lista Paginada */}
        {carregando ? (
          <View style={styles.centro}>
            <ActivityIndicator size="large" color="#F97316" />
          </View>
        ) : (
          <FlatList
            data={treinos}
            keyExtractor={(item) => String(item.ID_TR)}
            contentContainerStyle={styles.lista}
            renderItem={({ item }) => (
              <TreinoCard
                treino={item}
                modoEdicao={modoEdicao}
                onAbrirTreino={abrirExecucaoTreino}
                onEditar={abrirModalEditar}
                onExcluir={handleExcluir}
              />
            )}
            ListEmptyComponent={
              <View style={styles.vazio}>
                <Text style={styles.vazioTitulo}>Nenhum exercício encontrado</Text>
                <Text style={styles.vazioSubtitulo}>
                  Toque em "+ Novo" para cadastrar seu primeiro exercício.
                </Text>
              </View>
            }
          />
        )}

        {/* Barra de Paginação */}
        <PaginationBar
          paginaAtual={paginaAtual}
          totalPaginas={totalPaginas}
          onAnterior={() => setPaginaAtual((p) => Math.max(1, p - 1))}
          onProxima={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
        />

        {/* Modal de Cadastro e Edição */}
        <FormModal
          visivel={modalVisivel}
          treinoEditando={treinoEditando}
          onFechar={() => setModalVisivel(false)}
          onSalvar={handleSalvar}
        />

        {/* Tela de Execução do Treino + Instruções + Adaptação Automática */}
        <TreinoExecucaoModal
          treino={treinoExecutando}
          onFechar={() => setTreinoExecutando(null)}
          onAdaptarTreino={handleAdaptarTreino}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 12,
  },
  headerAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  subtitulo: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: '800',
    color: '#F8FAFC',
  },
  botaoPincel: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoPincelAtivo: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  textoPincel: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '700',
  },
  textoPincelAtivo: {
    color: '#0F172A',
  },
  botaoNovo: {
    backgroundColor: '#F97316',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  textoBotaoNovo: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 14,
  },
  bannerEdicao: {
    marginHorizontal: 20,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F9731622',
    borderWidth: 1,
    borderColor: '#F9731655',
  },
  bannerEdicaoTexto: {
    color: '#FDBA74',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  topoControle: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  resumoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  resumoTexto: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  resumoPagina: {
    color: '#64748B',
    fontSize: 12,
  },
  inputBusca: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#F8FAFC',
    fontSize: 14,
  },
  lista: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vazio: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  vazioTitulo: {
    color: '#E2E8F0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  vazioSubtitulo: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
  },
});
