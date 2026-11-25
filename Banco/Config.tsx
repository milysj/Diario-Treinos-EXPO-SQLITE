import * as SQLite from 'expo-sqlite';

export type TipoMedida = 'reps' | 'segundos';

// Tipo que representa um registro da tabela TREINO
export interface Treino {
  ID_TR: number;
  EXERCICIO: string;
  GRUPO_MUSCULAR: string;
  SERIES: number;
  REPETICOES: number;
  CARGA: number;
  TIPO_MEDIDA: TipoMedida;
  INSTRUCOES: string;
}

// Dados enviados pelo formulário ao criar ou editar um treino
export interface TreinoInput {
  exercicio: string;
  grupoMuscular: string;
  series: number;
  repeticoes: number;
  carga: number;
  tipoMedida: TipoMedida;
  instrucoes: string;
}

// Retorno da consulta paginada
export interface ResultadoPaginado {
  itens: Treino[];
  totalRegistros: number;
  totalPaginas: number;
}

// 12 exercícios iniciais com instruções detalhadas (3 páginas de 5 itens)
const TREINOS_INICIAIS: TreinoInput[] = [
  {
    exercicio: 'Supino Reto com Barra',
    grupoMuscular: 'Peito',
    series: 4,
    repeticoes: 10,
    carga: 60,
    tipoMedida: 'reps',
    instrucoes:
      'Deite-se no banco com os pés firmes no chão e escápulas retraídas. Desça a barra de forma controlada até a linha do peito e empurre para cima sem travar totalmente os cotovelos.',
  },
  {
    exercicio: 'Supino Inclinado com Halteres',
    grupoMuscular: 'Peito',
    series: 3,
    repeticoes: 12,
    carga: 24,
    tipoMedida: 'reps',
    instrucoes:
      'Ajuste o banco entre 30° e 45°. Com um halter em cada mão, desça abrindo levemente os cotovelos até alinhar com o peito superior e suba aproximando os halteres.',
  },
  {
    exercicio: 'Puxada Frontal na Polia',
    grupoMuscular: 'Costas',
    series: 4,
    repeticoes: 10,
    carga: 55,
    tipoMedida: 'reps',
    instrucoes:
      'Segure a barra com pegada aberta, tronco levemente inclinado para trás. Puxe a barra em direção ao peito levando os cotovelos para baixo e para trás, e retorne devagar.',
  },
  {
    exercicio: 'Remada Curvada com Barra',
    grupoMuscular: 'Costas',
    series: 4,
    repeticoes: 8,
    carga: 50,
    tipoMedida: 'reps',
    instrucoes:
      'Mantenha a coluna reta, joelhos semiflexionados e tronco inclinado à frente. Puxe a barra em direção ao umbigo contraindo as costas e desça controlando o movimento.',
  },
  {
    exercicio: 'Agachamento Livre',
    grupoMuscular: 'Pernas',
    series: 4,
    repeticoes: 10,
    carga: 80,
    tipoMedida: 'reps',
    instrucoes:
      'Posicione a barra sobre o trapézio, pés na largura dos ombros. Desça jogando o quadril para trás mantendo o peito aberto e joelhos alinhados com a ponta dos pés.',
  },
  {
    exercicio: 'Leg Press 45°',
    grupoMuscular: 'Pernas',
    series: 4,
    repeticoes: 12,
    carga: 160,
    tipoMedida: 'reps',
    instrucoes:
      'Apoie bem a lombar no encosto e coloque os pés na plataforma na largura dos ombros. Flexione os joelhos até cerca de 90° e empurre sem estender totalmente os joelhos.',
  },
  {
    exercicio: 'Cadeira Extensora',
    grupoMuscular: 'Pernas',
    series: 3,
    repeticoes: 15,
    carga: 45,
    tipoMedida: 'reps',
    instrucoes:
      'Ajuste o encosto para que o joelho fique alinhado ao eixo da máquina. Estenda as pernas até contrair bem o quadríceps, segure 1 segundo no topo e desça devagar.',
  },
  {
    exercicio: 'Desenvolvimento com Halteres',
    grupoMuscular: 'Ombros',
    series: 4,
    repeticoes: 10,
    carga: 18,
    tipoMedida: 'reps',
    instrucoes:
      'Sentado com as costas apoiadas, posicione os halteres na altura das orelhas. Empurre para cima até quase unir os pesos e desça de forma controlada.',
  },
  {
    exercicio: 'Elevação Lateral',
    grupoMuscular: 'Ombros',
    series: 3,
    repeticoes: 15,
    carga: 10,
    tipoMedida: 'reps',
    instrucoes:
      'Em pé com os cotovelos levemente flexionados, eleve os halteres lateralmente até a altura dos ombros sem balançar o tronco. Desça devagar resistindo à gravidade.',
  },
  {
    exercicio: 'Rosca Direta com Barra W',
    grupoMuscular: 'Braços',
    series: 3,
    repeticoes: 12,
    carga: 28,
    tipoMedida: 'reps',
    instrucoes:
      'Mantenha os cotovelos fixos ao lado do corpo e a postura firme. Flexione os braços levando a barra em direção aos ombros e desça devagar sem usar impulso.',
  },
  {
    exercicio: 'Tríceps Corda na Polia',
    grupoMuscular: 'Braços',
    series: 3,
    repeticoes: 12,
    carga: 30,
    tipoMedida: 'reps',
    instrucoes:
      'Segure a corda com os cotovelos colados ao tronco. Estenda os braços para baixo abrindo levemente as pontas da corda no final do movimento e retorne controlando.',
  },
  {
    exercicio: 'Prancha Abdominal',
    grupoMuscular: 'Abdômen',
    series: 3,
    repeticoes: 60,
    carga: 0,
    tipoMedida: 'segundos',
    instrucoes:
      'Apoie os antebraços e as pontas dos pés no chão mantendo o corpo alinhado da cabeça aos calcanhares. Contraia o abdômen e glúteos, evitando deixar o quadril cair ou subir demais.',
  },
];

// ----------------------------------------------------------------------------
// 1. Abrir ou criar o banco de dados local no dispositivo
async function Banco() {
  const db = await SQLite.openDatabaseAsync('DiarioTreinos.db');
  return db;
}

// ----------------------------------------------------------------------------
// 2. Criar tabela TREINO e fazer migração segura caso já exista uma versão anterior
async function createTable(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS TREINO (
      ID_TR INTEGER PRIMARY KEY AUTOINCREMENT,
      EXERCICIO VARCHAR(100) NOT NULL,
      GRUPO_MUSCULAR VARCHAR(50) NOT NULL,
      SERIES INTEGER NOT NULL,
      REPETICOES INTEGER NOT NULL,
      CARGA REAL NOT NULL,
      TIPO_MEDIDA VARCHAR(20) NOT NULL DEFAULT 'reps',
      INSTRUCOES TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS APP_META (
      CHAVE VARCHAR(50) PRIMARY KEY,
      VALOR VARCHAR(50) NOT NULL
    );
  `);

  // Migração segura para bancos criados antes da inclusão das novas colunas
  const colunas = await db.getAllAsync<{ name: string }>('PRAGMA table_info(TREINO)');
  const nomesColunas = colunas.map((c) => c.name);

  if (!nomesColunas.includes('TIPO_MEDIDA')) {
    await db.execAsync(
      "ALTER TABLE TREINO ADD COLUMN TIPO_MEDIDA VARCHAR(20) NOT NULL DEFAULT 'reps';"
    );
  }

  if (!nomesColunas.includes('INSTRUCOES')) {
    await db.execAsync(
      "ALTER TABLE TREINO ADD COLUMN INSTRUCOES TEXT NOT NULL DEFAULT '';"
    );
  }

  // Preenche instruções e tipo de medida nos exercícios iniciais já existentes sem instrução
  for (const item of TREINOS_INICIAIS) {
    await db.runAsync(
      `UPDATE TREINO
       SET INSTRUCOES = ?, TIPO_MEDIDA = ?
       WHERE EXERCICIO = ? AND (INSTRUCOES IS NULL OR INSTRUCOES = '')`,
      item.instrucoes,
      item.tipoMedida,
      item.exercicio
    );
  }
}

// ----------------------------------------------------------------------------
// 3. Popular 12 registros iniciais apenas na primeira vez que o app abrir
async function seedTreinos(db: SQLite.SQLiteDatabase) {
  const controle = await db.getFirstAsync<{ VALOR: string }>(
    'SELECT VALOR FROM APP_META WHERE CHAVE = ?',
    'SEED_TREINOS_OK'
  );

  if (controle) {
    return;
  }

  await db.withTransactionAsync(async () => {
    for (const item of TREINOS_INICIAIS) {
      await db.runAsync(
        `INSERT INTO TREINO (EXERCICIO, GRUPO_MUSCULAR, SERIES, REPETICOES, CARGA, TIPO_MEDIDA, INSTRUCOES)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        item.exercicio,
        item.grupoMuscular,
        item.series,
        item.repeticoes,
        item.carga,
        item.tipoMedida,
        item.instrucoes
      );
    }

    await db.runAsync(
      'INSERT INTO APP_META (CHAVE, VALOR) VALUES (?, ?)',
      'SEED_TREINOS_OK',
      '1'
    );
  });
}

// ----------------------------------------------------------------------------
// 4. CREATE — Inserir novo treino no banco
async function insertTreino(db: SQLite.SQLiteDatabase, dados: TreinoInput) {
  await db.runAsync(
    `INSERT INTO TREINO (EXERCICIO, GRUPO_MUSCULAR, SERIES, REPETICOES, CARGA, TIPO_MEDIDA, INSTRUCOES)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    dados.exercicio.trim(),
    dados.grupoMuscular,
    dados.series,
    dados.repeticoes,
    dados.carga,
    dados.tipoMedida,
    dados.instrucoes.trim()
  );
}

// ----------------------------------------------------------------------------
// 5. READ — Listar treinos com PAGINAÇÃO (LIMIT e OFFSET) e busca opcional
async function selectTreinosPaginado(
  db: SQLite.SQLiteDatabase,
  pagina: number,
  itensPorPagina: number,
  busca: string = ''
): Promise<ResultadoPaginado> {
  const termo = busca.trim();
  const offset = (pagina - 1) * itensPorPagina;

  if (termo.length > 0) {
    const like = `%${termo}%`;

    const contagem = await db.getFirstAsync<{ total: number }>(
      `SELECT COUNT(*) AS total
       FROM TREINO
       WHERE EXERCICIO LIKE ? OR GRUPO_MUSCULAR LIKE ?`,
      like,
      like
    );

    const itens = await db.getAllAsync<Treino>(
      `SELECT * FROM TREINO
       WHERE EXERCICIO LIKE ? OR GRUPO_MUSCULAR LIKE ?
       ORDER BY ID_TR DESC
       LIMIT ? OFFSET ?`,
      like,
      like,
      itensPorPagina,
      offset
    );

    const totalRegistros = contagem?.total ?? 0;
    const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));

    return { itens, totalRegistros, totalPaginas };
  }

  const contagem = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) AS total FROM TREINO'
  );

  const itens = await db.getAllAsync<Treino>(
    'SELECT * FROM TREINO ORDER BY ID_TR DESC LIMIT ? OFFSET ?',
    itensPorPagina,
    offset
  );

  const totalRegistros = contagem?.total ?? 0;
  const totalPaginas = Math.max(1, Math.ceil(totalRegistros / itensPorPagina));

  return { itens, totalRegistros, totalPaginas };
}

// ----------------------------------------------------------------------------
// 6. UPDATE — Atualizar todos os dados de um treino pelo ID
async function updateTreino(
  db: SQLite.SQLiteDatabase,
  id: number,
  dados: TreinoInput
) {
  await db.runAsync(
    `UPDATE TREINO
     SET EXERCICIO = ?, GRUPO_MUSCULAR = ?, SERIES = ?, REPETICOES = ?, CARGA = ?, TIPO_MEDIDA = ?, INSTRUCOES = ?
     WHERE ID_TR = ?`,
    dados.exercicio.trim(),
    dados.grupoMuscular,
    dados.series,
    dados.repeticoes,
    dados.carga,
    dados.tipoMedida,
    dados.instrucoes.trim(),
    id
  );
}

// ----------------------------------------------------------------------------
// 7. UPDATE (Adaptação) — Adapta séries, repetições/segundos e carga após o treino
async function adaptarTreinoPosExecucao(
  db: SQLite.SQLiteDatabase,
  id: number,
  novasSeries: number,
  novasRepeticoes: number,
  novaCarga: number
) {
  await db.runAsync(
    `UPDATE TREINO
     SET SERIES = ?, REPETICOES = ?, CARGA = ?
     WHERE ID_TR = ?`,
    novasSeries,
    novasRepeticoes,
    novaCarga,
    id
  );
}

// ----------------------------------------------------------------------------
// 8. DELETE — Excluir um treino pelo ID
async function deleteTreino(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM TREINO WHERE ID_TR = ?', id);
}

// ----------------------------------------------------------------------------
// 9. DROP — Remover tabelas (útil para testes de reset)
async function dropTable(db: SQLite.SQLiteDatabase) {
  await db.execAsync('DROP TABLE IF EXISTS TREINO; DROP TABLE IF EXISTS APP_META;');
}

export {
  Banco,
  createTable,
  seedTreinos,
  insertTreino,
  selectTreinosPaginado,
  updateTreino,
  adaptarTreinoPosExecucao,
  deleteTreino,
  dropTable,
};
