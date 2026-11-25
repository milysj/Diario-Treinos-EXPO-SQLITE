import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Treino } from '../../Banco/Config';

interface TreinoCardProps {
  treino: Treino;
  modoEdicao: boolean; // Editar e Excluir só aparecem quando o pincel de edição está ativo
  onAbrirTreino: (treino: Treino) => void;
  onEditar: (treino: Treino) => void;
  onExcluir: (treino: Treino) => void;
}

// Cores de destaque para cada grupo muscular
const CORES_GRUPO: Record<string, string> = {
  Peito: '#F97316',
  Costas: '#38BDF8',
  Pernas: '#A855F7',
  Ombros: '#EAB308',
  Braços: '#10B981',
  Abdômen: '#EC4899',
};

export function TreinoCard({
  treino,
  modoEdicao,
  onAbrirTreino,
  onEditar,
  onExcluir,
}: TreinoCardProps) {
  const corBadge = CORES_GRUPO[treino.GRUPO_MUSCULAR] ?? '#94A3B8';
  const ehSegundos = treino.TIPO_MEDIDA === 'segundos';

  return (
    <TouchableOpacity
      style={[styles.card, modoEdicao && styles.cardModoEdicao]}
      onPress={() => onAbrirTreino(treino)}
      activeOpacity={0.82}
    >
      {/* Cabeçalho do card: nome do exercício + tag do grupo muscular */}
      <View style={styles.topo}>
        <Text style={styles.titulo} numberOfLines={2}>
          {treino.EXERCICIO}
        </Text>
        <View style={[styles.badge, { backgroundColor: `${corBadge}22`, borderColor: corBadge }]}>
          <Text style={[styles.badgeTexto, { color: corBadge }]}>
            {treino.GRUPO_MUSCULAR}
          </Text>
        </View>
      </View>

      {/* Métricas do treino: Séries, Repetições/Tempo e Carga */}
      <View style={styles.metricas}>
        <View style={styles.metricaBox}>
          <Text style={styles.metricaLabel}>Séries</Text>
          <Text style={styles.metricaValor}>{treino.SERIES}x</Text>
        </View>

        <View style={styles.metricaBox}>
          <Text style={styles.metricaLabel}>{ehSegundos ? 'Tempo' : 'Repetições'}</Text>
          <Text style={styles.metricaValor}>
            {ehSegundos ? `${treino.REPETICOES} seg` : treino.REPETICOES}
          </Text>
        </View>

        <View style={[styles.metricaBox, styles.metricaDestaque]}>
          <Text style={styles.metricaLabel}>Carga</Text>
          <Text style={styles.metricaValorDestaque}>
            {treino.CARGA > 0 ? `${treino.CARGA} kg` : 'Corporal'}
          </Text>
        </View>
      </View>

      {/* Rodapé: mostra "Iniciar treino" no modo normal ou "Editar / Excluir" no modo edição */}
      {modoEdicao ? (
        <View style={styles.acoes}>
          <TouchableOpacity
            style={styles.botaoEditar}
            onPress={() => onEditar(treino)}
            activeOpacity={0.75}
          >
            <Text style={styles.textoEditar}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.botaoExcluir}
            onPress={() => onExcluir(treino)}
            activeOpacity={0.75}
          >
            <Text style={styles.textoExcluir}>Excluir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.rodapeTreino}>
          <Text style={styles.dicaTreino}>Toque para ver instruções e treinar</Text>
          <Text style={styles.setaTreino}>Treinar →</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardModoEdicao: {
    borderColor: '#F9731688',
  },
  topo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 14,
  },
  titulo: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeTexto: {
    fontSize: 12,
    fontWeight: '700',
  },
  metricas: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  metricaBox: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  metricaDestaque: {
    borderWidth: 1,
    borderColor: '#F9731644',
  },
  metricaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 2,
  },
  metricaValor: {
    fontSize: 15,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  metricaValorDestaque: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FB923C',
  },
  rodapeTreino: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#33415566',
    paddingTop: 10,
  },
  dicaTreino: {
    color: '#94A3B8',
    fontSize: 12,
  },
  setaTreino: {
    color: '#FB923C',
    fontSize: 13,
    fontWeight: '700',
  },
  acoes: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#33415566',
    paddingTop: 12,
  },
  botaoEditar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#334155',
  },
  textoEditar: {
    color: '#F8FAFC',
    fontSize: 13,
    fontWeight: '600',
  },
  botaoExcluir: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#7F1D1D',
  },
  textoExcluir: {
    color: '#FCA5A5',
    fontSize: 13,
    fontWeight: '600',
  },
});
