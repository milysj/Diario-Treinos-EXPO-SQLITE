import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface PaginationBarProps {
  paginaAtual: number;
  totalPaginas: number;
  onAnterior: () => void;
  onProxima: () => void;
}

export function PaginationBar({
  paginaAtual,
  totalPaginas,
  onAnterior,
  onProxima,
}: PaginationBarProps) {
  const primeiraPagina = paginaAtual <= 1;
  const ultimaPagina = paginaAtual >= totalPaginas;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.botao, primeiraPagina && styles.botaoDesabilitado]}
        onPress={onAnterior}
        disabled={primeiraPagina}
      >
        <Text style={[styles.textoBotao, primeiraPagina && styles.textoDesabilitado]}>
          ← Anterior
        </Text>
      </TouchableOpacity>

      <Text style={styles.indicador}>
        Página {paginaAtual} de {totalPaginas}
      </Text>

      <TouchableOpacity
        style={[styles.botao, ultimaPagina && styles.botaoDesabilitado]}
        onPress={onProxima}
        disabled={ultimaPagina}
      >
        <Text style={[styles.textoBotao, ultimaPagina && styles.textoDesabilitado]}>
          Próxima →
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderColor: '#334155',
  },
  botao: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: '#F97316',
  },
  botaoDesabilitado: {
    backgroundColor: '#334155',
  },
  textoBotao: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 13,
  },
  textoDesabilitado: {
    color: '#64748B',
  },
  indicador: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '600',
  },
});
