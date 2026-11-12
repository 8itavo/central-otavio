const banco = supabase.createClient(
  'https://diejzmwaaewrikgjcjbc.supabase.co',
  'sb_publishable_opMMWvrbXYS7lum851wJfA_q6PXlDWM'
);

/* ---------- Constantes ---------- */
const FRENTES = { agencia: 'Agência', marca_pessoal: 'Marca pessoal', vida_pessoal: 'Vida pessoal', casamento: 'Casamento', subido_pro: 'Subido Pro' };
const STATUS_CLIENTE = { ativo: 'Ativo', em_risco: 'Em risco', pausado: 'Pausado', encerrado: 'Encerrado' };
const ETAPAS = { novo: 'Novo', contato: 'Contato feito', conversa: 'Em conversa', proposta: 'Proposta', ganho: 'Ganho', perdido: 'Perdido' };
const ESCOPOS = { empresa: 'Empresa', pessoal: 'Pessoal' };
const TIPOS = { saida: 'Saída', entrada: 'Entrada' };
const ROTEIRO = [
  ['caixa', 'Esvaziar a Caixa de entrada'],
  ['feito', 'Ver o que foi feito e o que ficou para trás'],
  ['numeros', 'Conferir caixa, cobranças, clientes e follow-ups'],
  ['agenda', 'Olhar os compromissos da próxima semana'],
  ['metas', 'Escolher até 3 metas da semana'],
  ['blocos', 'Reservar os blocos no Google Agenda']
];
const DIAS_SEM_CONTATO = 30;
const ICONES = {
  hoje: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
  semana: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  tarefas: '<path d="m4 7 2 2 3-3M4 17l2 2 3-3M13 8h7M13 18h7"/>',
  clientes: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.2-5.5 6.5-5.5s5.900 1.900 6.500 5.500M16 5a3.500 3.500 0 0 1 0 6.500M18 15c2 .7 3.200 2.400 3.500 5"/>',
  prospeccao: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  financeiro: '<path d="M12 3v18M17 7.500C16 6 14.300 5.500 12 5.500c-2.800 0-5 1.300-5 3.300s2 2.800 5 3.300 5 1.300 5 3.300-2.200 3.300-5 3.300c-2.500 0-4.300-.7-5.200-2.200"/>',
  geral: '<rect x="3" y="3" width="7" height="9" rx="2"/><rect x="14" y="3" width="7" height="5" rx="2"/><rect x="14" y="12" width="7" height="9" rx="2"/><rect x="3" y="16" width="7" height="5" rx="2"/>',
  agencia: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  pessoal: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.500-6 8-6s7 2 8 6"/>',
  lancamentos: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/>',
  feito: '<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
  alerta: '<path d="M12 3 2.500 20h19L12 3Z"/><path d="M12 10v4M12 17v.5"/>',
  carteira: '<rect x="3" y="6" width="18" height="14" rx="3"/><path d="M3 10h18M16 15h2"/>',
  subir: '<path d="M4 17 10 11l4 4 6-7"/><path d="M15 8h5v5"/>',
  descer: '<path d="M4 7l6 6 4-4 6 7"/><path d="M15 16h5v-5"/>',
  historico: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
  casa: '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10M10 20v-6h4v6"/>'
};
// Menu em três frentes: o que é dos dois, a agência e a vida pessoal
const MENU = [
  ['Geral', [['geral', 'Visão geral'], ['historico', 'Histórico'], ['semana', 'Semana'], ['tarefas', 'Tarefas']]],
  ['Agência', [['agencia', 'Painel da agência'], ['clientes', 'Clientes'], ['prospeccao', 'Prospecção']]],
  ['Pessoal', [['pessoal', 'Painel pessoal']]],
  ['Dados', [['lancamentos', 'Lançamentos']]]
];
const MENU_CELULAR = [['geral', 'Geral'], ['agencia', 'Agência'], ['clientes', 'Clientes'], ['pessoal', 'Pessoal'], ['tarefas', 'Tarefas']];

/* ---------- Estado ---------- */
const dados = { tarefas: [], clientes: [], leads: [], contas: [], lancamentos: [], metas_semana: [], revisoes_semana: [], agenda_eventos: [], documentos: [], compromissos: [], imoveis: [] };
const ui = { tela: 'geral', filtroLanc: 'todos', diaPrioridade: 'hoje', frente: 'todas', escopo: 'empresa', mes: null, statusCliente: 'abertos', deslocamentoSemana: 0, clienteId: null, tipoDoc: 'contrato', periodo: '12', visao: 'tudo' };
const manipuladores = {};

/* ---------- Utilidades ---------- */
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FUSO = 'America/Sao_Paulo';
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date());
const somarDias = (iso, n) => { const d = new Date(iso + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const diasEntre = (a, b) => Math.round((new Date(b + 'T12:00:00Z') - new Date(a + 'T12:00:00Z')) / 86400000);
// A semana começa na segunda; no domingo, a revisão já olha para a semana seguinte
const inicioSemana = iso => { const dia = new Date(iso + 'T12:00:00Z').getUTCDay(); return somarDias(iso, dia === 0 ? 1 : 1 - dia); };
const fmtData = (iso, op = { day: '2-digit', month: '2-digit' }) => iso ? new Intl.DateTimeFormat('pt-BR', { ...op, timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')) : '';
const moeda = v => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
const horaDe = ts => new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: '2-digit', minute: '2-digit' }).format(new Date(ts));
const diaDe = ts => new Intl.DateTimeFormat('en-CA', { timeZone: FUSO }).format(new Date(ts));
const nomeMes = mes => new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(mes + '-15T12:00:00Z'));
const somarMes = (mes, n) => { const d = new Date(mes + '-15T12:00:00Z'); d.setUTCMonth(d.getUTCMonth() + n); return d.toISOString().slice(0, 7); };

function avisar(texto, erro = false) {
  const m = $('mensagem');
  m.textContent = texto;
  m.classList.toggle('erro', erro);
  m.hidden = false;
  clearTimeout(avisar.t);
  avisar.t = setTimeout(() => { m.hidden = true; }, 4500);
}

const traduzirErro = e => e.message.includes('Limite de 3 prioridades') ? 'Esse dia já tem 3 prioridades. Tire uma antes de escolher outra.'
  : e.message.includes('Limite de 3 metas') ? 'Esta semana já tem 3 metas.' : 'Não consegui salvar: ' + e.message;

/* ---------- Banco ---------- */
async function carregar() {
  const nomes = Object.keys(dados);
  const respostas = await Promise.all(nomes.map(n => banco.from(n).select('*')));
  respostas.forEach((r, i) => {
    if (r.error) avisar('Não consegui carregar ' + nomes[i] + ': ' + r.error.message, true);
    else dados[nomes[i]] = r.data;
  });
  desenhar();
}

async function gravar(tabela, campos, id) {
  const consulta = id ? banco.from(tabela).update(campos).eq('id', id) : banco.from(tabela).insert(campos);
  const { error } = await consulta;
  if (error) { avisar(traduzirErro(error), true); return false; }
  await carregar();
  return true;
}

async function apagar(tabela, id) {
  const { error } = await banco.from(tabela).delete().eq('id', id);
  if (error) { avisar('Não consegui apagar: ' + error.message, true); return false; }
  await carregar();
  return true;
}

/* ---------- Formulários ---------- */
const opcoes = obj => Object.entries(obj).map(([v, r]) => [v, r]);
const opcoesClientes = () => [['', 'Nenhum'], ...dados.clientes.slice().sort((a, b) => a.nome.localeCompare(b.nome)).map(c => [c.id, c.nome])];
const opcoesContas = escopo => [['', 'Nenhuma'], ...dados.contas.filter(c => c.ativa && (!escopo || c.escopo === escopo)).map(c => [c.id, c.nome])];

const FORMULARIOS = {
  tarefas: { nome: 'tarefa', campos: () => [
    { n: 'titulo', r: 'O que precisa ser feito', largo: true, req: true },
    { n: 'frente', r: 'Frente', op: [['', 'Sem frente (Caixa de entrada)'], ...opcoes(FRENTES)] },
    { n: 'vencimento', r: 'Prazo', tipo: 'date' },
    { n: 'cliente_id', r: 'Cliente', op: opcoesClientes(), largo: true },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ], antes: (v, reg) => ({ ...v, status: reg?.status === 'feita' ? 'feita' : (v.frente ? 'a_fazer' : 'caixa') }) },
  clientes: { nome: 'cliente', campos: () => [
    { n: 'nome', r: 'Nome do cliente', largo: true, req: true },
    { n: 'contato', r: 'Pessoa de contato' }, { n: 'telefone', r: 'Telefone', tipo: 'tel' },
    { n: 'status', r: 'Situação', op: opcoes(STATUS_CLIENTE) },
    { n: 'valor_mensal', r: 'Valor mensal (R$)', tipo: 'number', num: true },
    { n: 'dia_vencimento', r: 'Dia de vencimento', tipo: 'number', num: true, min: 1, max: 31 },
    { n: 'ultimo_contato', r: 'Último contato', tipo: 'date' },
    { n: 'proxima_acao', r: 'Próxima ação' }, { n: 'proxima_acao_em', r: 'Data da próxima ação', tipo: 'date' },
    { n: 'servicos', r: 'Serviços contratados', largo: true },
    { n: 'pagador', r: 'Nome que aparece no Pix (para achar os pagamentos)', largo: true },
    { n: 'contrato_inicio', r: 'Início do contrato', tipo: 'date' }, { n: 'contrato_fim', r: 'Fim do contrato', tipo: 'date' },
    { n: 'grupo', r: 'Grupo (junta unidades do mesmo contrato)', largo: true },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ] },
  leads: { nome: 'lead', campos: () => [
    { n: 'nome', r: 'Nome', req: true }, { n: 'empresa', r: 'Empresa' },
    { n: 'telefone', r: 'Telefone', tipo: 'tel' }, { n: 'nicho', r: 'Nicho' },
    { n: 'canal', r: 'Como chegou (Instagram, indicação...)' },
    { n: 'etapa', r: 'Etapa', op: opcoes(ETAPAS) },
    { n: 'valor_estimado', r: 'Valor mensal estimado (R$)', tipo: 'number', num: true },
    { n: 'proximo_followup', r: 'Próximo follow-up', tipo: 'date' },
    { n: 'proxima_acao', r: 'Próxima ação', largo: true },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ] },
  lancamentos: { nome: 'lançamento', campos: reg => [
    { n: 'descricao', r: 'Descrição', largo: true, req: true },
    { n: 'tipo', r: 'Tipo', op: opcoes(TIPOS) },
    { n: 'escopo', r: 'De quem é', op: opcoes(ESCOPOS) },
    { n: 'valor', r: 'Valor (R$)', tipo: 'number', num: true, req: true },
    { n: 'vencimento', r: 'Vencimento', tipo: 'date', req: true },
    { n: 'categoria', r: 'Categoria' },
    { n: 'conta_id', r: 'Conta', op: opcoesContas() },
    { n: 'cliente_id', r: 'Cliente', op: opcoesClientes(), largo: true },
    { n: 'pago', r: 'Situação', op: [['false', 'Em aberto'], ['true', 'Pago / recebido']], bool: true, largo: true },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ], antes: (v, reg) => ({ ...v, pago_em: v.pago ? (reg?.pago_em || hoje()) : null }) },
  compromissos: { nome: 'despesa fixa ou parcela', campos: () => [
    { n: 'descricao', r: 'O que é (ex.: MBA Subido Pró)', largo: true, req: true },
    { n: 'escopo', r: 'De quem é', op: opcoes(ESCOPOS) },
    { n: 'valor', r: 'Valor por mês ou da parcela (R$)', tipo: 'number', num: true, req: true },
    { n: 'parcelas', r: 'Número de parcelas (vazio = todo mês, sem fim)', tipo: 'number', num: true, min: 1 },
    { n: 'inicio', r: 'Mês da 1ª parcela', tipo: 'date', req: true },
    { n: 'ja_pago', r: 'Entrada já paga (R$)', tipo: 'number', num: true },
    { n: 'categoria', r: 'Categoria' }, { n: 'forma', r: 'Como paga (cartão, Pix...)' },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ], antes: v => ({ ...v, ja_pago: v.ja_pago || 0 }) },
  imoveis: { nome: 'imóvel', campos: () => [
    { n: 'nome', r: 'Nome', largo: true, req: true },
    { n: 'endereco', r: 'Endereço', largo: true },
    { n: 'situacao', r: 'Situação', op: [['alugado', 'Alugado'], ['moradia', 'Moramos nele'], ['vazio', 'Vazio']] },
    { n: 'mudanca_prevista', r: 'Mudança prevista', tipo: 'date' },
    { n: 'inquilino', r: 'Inquilino(a)' }, { n: 'telefone', r: 'Telefone do inquilino', tipo: 'tel' },
    { n: 'aluguel', r: 'Aluguel (R$)', tipo: 'number', num: true }, { n: 'dia_aluguel', r: 'Dia de cobrar o aluguel', tipo: 'number', num: true, min: 1, max: 31 },
    { n: 'pagador_aluguel', r: 'Nome que aparece no Pix do aluguel', largo: true },
    { n: 'prestacao', r: 'Prestação da Caixa (R$)', tipo: 'number', num: true }, { n: 'dia_prestacao', r: 'Dia da prestação', tipo: 'number', num: true, min: 1, max: 31 },
    { n: 'condominio', r: 'Condomínio (R$)', tipo: 'number', num: true }, { n: 'dia_condominio', r: 'Vencimento do condomínio', tipo: 'number', num: true, min: 1, max: 31 },
    { n: 'condominio_pago_por', r: 'Quem paga o condomínio', op: [['Inquilina', 'Inquilino(a)'], ['Nós', 'Nós']] },
    { n: 'saldo_devedor', r: 'Saldo devedor (R$)', tipo: 'number', num: true }, { n: 'saldo_em', r: 'Saldo conferido em', tipo: 'date' },
    { n: 'prazo_meses', r: 'Prazo total (meses)', tipo: 'number', num: true, min: 1 }, { n: 'meses_restantes', r: 'Meses restantes', tipo: 'number', num: true, min: 1 },
    { n: 'notas', r: 'Notas', area: true, largo: true }
  ], antes: v => ({ ...v, aluguel: v.aluguel || 0, prestacao: v.prestacao || 0, condominio: v.condominio || 0 }) },
  contas: { nome: 'conta', campos: () => [
    { n: 'nome', r: 'Nome da conta (ex.: Nubank PJ)', largo: true, req: true },
    { n: 'escopo', r: 'De quem é', op: opcoes(ESCOPOS) },
    { n: 'saldo', r: 'Saldo atual (R$)', tipo: 'number', num: true, permiteNegativo: true }
  ] }
};

function abrirFormulario(tabela, id, padrao = {}) {
  const def = FORMULARIOS[tabela];
  const reg = id ? dados[tabela].find(x => x.id === id) : null;
  const valores = reg || padrao;
  const campos = def.campos(reg);
  const html = campos.map(c => {
    const v = valores[c.n];
    const cls = c.largo ? ' largo' : '';
    let entrada;
    if (c.op) entrada = `<select name="${c.n}">${c.op.map(([val, rot]) => `<option value="${esc(val)}" ${String(v ?? '') === String(val) ? 'selected' : ''}>${esc(rot)}</option>`).join('')}</select>`;
    else if (c.area) entrada = `<textarea name="${c.n}">${esc(v)}</textarea>`;
    else {
      const extra = c.tipo === 'number' ? `step="${c.min ? 1 : '0.01'}" ${c.permiteNegativo ? '' : `min="${c.min ?? 0}"`} ${c.max ? `max="${c.max}"` : ''} inputmode="decimal"` : '';
      entrada = `<input name="${c.n}" type="${c.tipo || 'text'}" value="${esc(v)}" ${c.req ? 'required' : ''} ${extra}>`;
    }
    return `<label class="campo${cls}">${esc(c.r)}${entrada}</label>`;
  }).join('');
  const d = $('dialogo');
  d.innerHTML = `<form method="dialog">
    <h2>${id ? 'Editar' : 'Novo'} ${esc(def.nome)}</h2>
    <div class="campos">${html}</div>
    <div class="rodape-dialogo">
      ${id ? '<button type="button" class="btn perigo" data-apagar>Apagar</button>' : ''}
      <button type="button" class="btn" data-fechar>Cancelar</button>
      <button class="btn azul" value="salvar">Salvar</button>
    </div></form>`;
  const form = d.querySelector('form');
  form.querySelector('[data-fechar]').onclick = () => d.close();
  const botaoApagar = form.querySelector('[data-apagar]');
  if (botaoApagar) botaoApagar.onclick = async () => {
    if (botaoApagar.dataset.confirmar) { if (await apagar(tabela, id)) d.close(); return; }
    botaoApagar.dataset.confirmar = '1';
    botaoApagar.textContent = 'Confirmar exclusão';
  };
  form.onsubmit = async e => {
    e.preventDefault();
    const fd = new FormData(form);
    let v = {};
    campos.forEach(c => {
      const bruto = fd.get(c.n);
      v[c.n] = c.bool ? bruto === 'true' : bruto === '' || bruto === null ? null : c.num ? Number(bruto) : String(bruto).trim();
    });
    if (tabela === 'clientes' && v.valor_mensal === null) v.valor_mensal = 0;
    if (tabela === 'contas' && v.saldo === null) v.saldo = 0;
    if (def.antes) v = def.antes(v, reg);
    if (await gravar(tabela, v, id)) d.close();
  };
  d.showModal();
}

/* ---------- Despesas fixas e parcelas ---------- */
const mesesEntre = (a, b) => (Number(b.slice(0, 4)) - Number(a.slice(0, 4))) * 12 + Number(b.slice(5, 7)) - Number(a.slice(5, 7));
function parcelaNoMes(c, m) { // número da parcela que cai no mês m (0 = não cai)
  const n = mesesEntre(c.inicio.slice(0, 7), m) + 1;
  if (!c.ativo || n < 1 || (c.parcelas && n > c.parcelas)) return 0;
  return n;
}
const comprometidoNoMes = (m, escopo) => dados.compromissos.filter(c => c.escopo === escopo && parcelaNoMes(c, m)).reduce((s, c) => s + Number(c.valor), 0);
function cartaoCompromissos(escopo, m = hoje().slice(0, 7)) {
  const itens = dados.compromissos.filter(c => c.escopo === escopo && c.ativo && (!c.parcelas || parcelaNoMes(c, m) || c.inicio.slice(0, 7) > m))
    .sort((a, b) => b.valor - a.valor);
  const proximos = ultimosMeses(somarMes(m, 5), 6).map(mm => ({ rotulo: rotuloMes(mm), valor: comprometidoNoMes(mm, escopo), destaque: mm === m }));
  const linha = c => {
    const n = parcelaNoMes(c, m);
    const total = c.parcelas ? Number(c.valor) * c.parcelas + Number(c.ja_pago) : 0;
    const pago = c.parcelas ? Number(c.ja_pago) + Number(c.valor) * Math.max(0, Math.min(c.parcelas, mesesEntre(c.inicio.slice(0, 7), m))) : 0;
    const info = !c.parcelas ? 'Todo mês' + (c.forma ? ' · ' + c.forma : '')
      : n ? `Parcela ${n} de ${c.parcelas} · termina em ${rotuloMes(somarMes(c.inicio.slice(0, 7), c.parcelas - 1))}/${somarMes(c.inicio.slice(0, 7), c.parcelas - 1).slice(2, 4)}`
      : `Começa em ${rotuloMes(c.inicio.slice(0, 7))}/${c.inicio.slice(2, 4)} · ${c.parcelas}x`;
    return `<li class="compromisso clicavel" data-acao="editar" data-tabela="compromissos" data-id="${c.id}" role="button" tabindex="0">
      <div class="linha">${avatar(c.descricao, c.descricao)}<div class="corpo"><b>${esc(c.descricao)}</b><small>${esc(info)}</small></div><span class="valor">${moeda(c.valor)}</span></div>
      ${c.parcelas ? `<div class="progresso"><div style="width:${pago / (total || 1) * 100}%"></div></div><small class="pago-total">Pago ${moedaCurta(pago)} de ${moedaCurta(total)}${Number(c.ja_pago) ? ` (entrada de ${moedaCurta(c.ja_pago)})` : ''}</small>` : ''}
    </li>`;
  };
  return `<section class="cartao"><h2>Despesas fixas e parcelas <small>${moedaCurta(comprometidoNoMes(m, escopo))} neste mês</small></h2>
    ${itens.length ? `<ul class="lista compromissos">${itens.map(linha).join('')}</ul>` : '<p class="vazio">Nada cadastrado.</p>'}
    <h3 class="sub">Já comprometido nos próximos meses</h3><div class="barras-compromisso">${barras(proximos, v => (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil')}</div>
    <p>${botaoNovo('compromissos', 'Nova despesa ou parcela', JSON.stringify({ escopo, inicio: hoje() }))}</p></section>`;
}

/* ---------- Apartamento ---------- */
const TIPOS_DOC = { contrato: 'Contrato', comprovante: 'Comprovante', outro: 'Outro' };
const linhaDoc = d => `<li class="linha">${avatar(TIPOS_DOC[d.tipo], d.tipo)}<div class="corpo clicavel" data-acao="abrir-doc" data-id="${d.id}" role="button" tabindex="0"><b>${esc(d.nome)}</b>
  <small>${esc(TIPOS_DOC[d.tipo])} · ${fmtData(d.data || d.criado_em.slice(0, 10))}</small></div>
  <button class="btn pequeno" data-acao="abrir-doc" data-id="${d.id}">Abrir</button>
  <button class="btn pequeno perigo" data-acao="apagar-doc" data-id="${d.id}">Apagar</button></li>`;
const formDoc = (attr = '') => `<form class="enviar-doc" data-form="documento" ${attr}>
  <select name="tipo" aria-label="Tipo de documento">${Object.entries(TIPOS_DOC).map(([v, r]) => `<option value="${v}" ${ui.tipoDoc === v ? 'selected' : ''}>${r}</option>`).join('')}</select>
  <input type="file" name="arquivo" accept="application/pdf,image/*" required>
  <button class="btn azul pequeno">Anexar</button></form>`;

function cartaoImovel(m) {
  const im = dados.imoveis[0];
  if (!im) return '';
  const doMes = cat => dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === m && l.categoria === cat);
  const alug = doMes('Aluguel do apartamento').filter(l => l.tipo === 'entrada'), prest = doMes('Financiamento do apartamento (Caixa)').filter(l => l.tipo === 'saida');
  const mesCorrente = m === hoje().slice(0, 7), dia = Number(hoje().slice(8, 10));
  const situacao = (itens, diaVenc, feito, falta) => itens.length ? `<span class="selo verde">${feito} ${fmtData(itens[0].vencimento)}</span>`
    : mesCorrente && diaVenc && dia < diaVenc ? `<span class="selo">Dia ${diaVenc}</span>` : `<span class="selo ambar">${falta}</span>`;
  const alugado = im.situacao === 'alugado';
  const pagas = im.prazo_meses && im.meses_restantes ? im.prazo_meses - im.meses_restantes : 0;
  const condNosso = !alugado || im.condominio_pago_por === 'Nós';
  const sobra = (alugado ? Number(im.aluguel) : 0) - Number(im.prestacao) - (condNosso ? Number(im.condominio) : 0);
  const custoMorando = Number(im.prestacao) + Number(im.condominio);
  const tel = (im.telefone || '').replace(/\D/g, '');
  const docs = dados.documentos.filter(d => d.imovel_id === im.id).sort((a, b) => (b.data || b.criado_em).localeCompare(a.data || a.criado_em));
  const serie = ultimosMeses(m).map(x => ({ rotulo: rotuloMes(x),
    entrada: somaV(dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === x && l.tipo === 'entrada' && l.categoria === 'Aluguel do apartamento')),
    saida: somaV(dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === x && l.tipo === 'saida' && l.categoria === 'Financiamento do apartamento (Caixa)')) }));
  const linha = (rot, sub, valor, sinal, selo) => `<li class="linha"><div class="corpo"><b>${esc(rot)}</b><small>${esc(sub)}</small></div>${selo}<span class="valor ${sinal === '+' ? 'positivo' : ''}">${sinal} ${moeda(valor)}</span></li>`;
  return `<section class="cartao"><h2>Apartamento <small><button class="btn pequeno" data-acao="editar" data-tabela="imoveis" data-id="${im.id}">Editar</button></small></h2>
    <p class="nota">${esc(im.nome)} · ${alugado ? 'Alugado' + (im.inquilino ? ' para ' + esc(im.inquilino) : '') : im.situacao === 'moradia' ? 'Vocês moram nele' : 'Vazio'}${tel && alugado ? ` · <a href="https://wa.me/${tel}" target="_blank" rel="noopener">WhatsApp ${esc(im.telefone)}</a>` : ''}</p>
    <ul class="lista">
      ${alugado ? linha('Aluguel', `Cobrar todo dia ${im.dia_aluguel || '?'}`, im.aluguel, '+', situacao(alug, im.dia_aluguel, 'Recebido', 'Não recebido')) : ''}
      ${linha('Prestação da Caixa', `Todo dia ${im.dia_prestacao || '?'}`, prest[0]?.valor || im.prestacao, '−', situacao(prest, im.dia_prestacao, 'Paga', 'Não paga'))}
      ${linha('Condomínio', `Vence dia ${im.dia_condominio || '?'}`, im.condominio, condNosso ? '−' : '', condNosso ? '' : '<span class="selo">Inquilina paga</span>')}
    </ul>
    ${metrica(sobra >= 0 ? 'Sobra por mês (aluguel − prestação)' : 'Custo do apartamento por mês', (sobra >= 0 ? '+ ' : '− ') + moeda(Math.abs(sobra)), 1, sobra >= 0 ? 'verde' : 'saida')}
    ${pagas ? metrica(`Financiamento: ${pagas} de ${im.prazo_meses} pagas`, `falta ${moedaCurta(im.saldo_devedor || 0)}`, pagas / im.prazo_meses) : ''}
    ${alugado ? `<div class="aviso-mudanca"><b>Quando vocês se mudarem${im.mudanca_prevista ? ' (' + fmtData(im.mudanca_prevista, { month: 'long', year: 'numeric' }) + ')' : ' (2027, mês a definir)'}</b>
      <span>O aluguel de ${moeda(im.aluguel)} para e o condomínio passa a ser de vocês. A casa vai custar ${moeda(custoMorando)} por mês (prestação + condomínio): ${moeda(Number(im.aluguel) + Number(im.condominio))} a menos no mês em relação a hoje.</span></div>` : ''}
    <h3 class="sub">Aluguel x prestação <small>últimos 6 meses</small></h3>${barrasDuplas(serie)}${legendaDupla('Aluguel recebido', 'Prestação paga')}
    <h3 class="sub">Documentos</h3>${formDoc(`data-imovel="${im.id}"`)}${lista(docs, linhaDoc, 'Nenhum documento ainda.')}
  </section>`;
}

// Barras empilhadas: meses [{rotulo, destaque, partes: {chave: valor}}], series [{chave, rotulo}]
function barrasEmpilhadas(meses, series) {
  const totais = meses.map(x => Object.values(x.partes).reduce((s, v) => s + v, 0));
  const max = Math.max(1, ...totais);
  return `<div class="barras empilhadas">${meses.map((x, i) => `<div class="barra ${x.destaque ? 'destaque' : ''}">
    <div class="coluna-barra"><div class="pilha" style="height:${Math.max(totais[i] / max * 100, 2)}%">${totais[i] ? `<em>${esc(moedaCurta(totais[i]))}</em>` : ''}
      ${series.map((s, k) => x.partes[s.chave] ? `<span style="flex:${x.partes[s.chave]};background:${CORES[k % CORES.length]}" title="${esc(s.rotulo)}: ${esc(moeda(x.partes[s.chave]))}"></span>` : '').join('')}</div></div>
    <small>${esc(x.rotulo)}</small></div>`).join('')}</div>
    <ul class="legenda legenda-linha">${series.map((s, k) => `<li><i style="background:${CORES[k % CORES.length]}"></i><span>${esc(s.rotulo)}</span></li>`).join('')}</ul>`;
}

/* ---------- Contratos (clientes agrupados por quem paga) ---------- */
const nomeCurto = c => c.grupo || c.nome.split(/ - | \(/)[0];
function clienteDoLancamento(l) {
  for (const c of dados.clientes) { const re = regexPagador(c); if (re && re.test(l.descricao || '')) return c; }
  return null;
}
const ehReceitaCliente = l => l.tipo === 'entrada' && ((l.escopo === 'empresa' && l.categoria === 'Receita de clientes') || ehClienteNoPessoal(l));
function regexPagador(c) { try { return c.pagador ? new RegExp(c.pagador, 'i') : null; } catch (e) { return null; } }
function contratosAtivos(abertos) {
  const grupos = new Map();
  abertos.forEach(c => { const k = c.grupo || c.id; if (!grupos.has(k)) grupos.set(k, []); grupos.get(k).push(c); });
  const m = hoje().slice(0, 7);
  return [...grupos.values()].map(us => {
    const c = us[0];
    const re = regexPagador(c);
    const valor = us.reduce((s, u) => s + Number(u.valor_mensal), 0);
    const pagMes = re ? dados.lancamentos.filter(l => l.tipo === 'entrada' && l.vencimento.slice(0, 7) === m && re.test(l.descricao || '')) : [];
    const recebidoMes = somaV(pagMes);
    const dia = Number(hoje().slice(8, 10));
    let situacao;
    if (!re) situacao = { chave: 'sem', texto: 'Informe o nome do Pix para acompanhar', cor: '' };
    else if (valor && recebidoMes >= valor * 0.95) situacao = { chave: 'pago', texto: `Pago · ${moeda(recebidoMes)} em ${fmtData(pagMes.map(l => l.vencimento).sort().pop())}`, cor: 'verde' };
    else if (recebidoMes > 0) situacao = { chave: 'parcial', texto: `Parcial · ${moeda(recebidoMes)} de ${moeda(valor)}`, cor: 'ambar' };
    else if (c.proxima_acao_em && c.proxima_acao_em >= hoje() && /parcela|pagamento/i.test(c.proxima_acao || '')) situacao = { chave: 'aguardando', texto: `Próxima parcela em ${fmtData(c.proxima_acao_em)}`, cor: '' };
    else if (c.dia_vencimento && dia <= c.dia_vencimento) situacao = { chave: 'aguardando', texto: `Vence dia ${c.dia_vencimento}`, cor: '' };
    else situacao = { chave: 'aberto', texto: 'Aguardando pagamento do mês', cor: 'ambar' };
    const ultimoPag = re ? dados.lancamentos.filter(l => l.tipo === 'entrada' && re.test(l.descricao || '')).sort((a, b) => b.vencimento.localeCompare(a.vencimento))[0] : null;
    return { id: c.id, nome: nomeCurto(c), conta: ultimoPag ? (ultimoPag.escopo === 'pessoal' ? 'Pix pessoal' : 'Conta PJ') : 'Sem pagamento ainda', unidades: us, valor, recebidoMes, situacao, inicio: c.contrato_inicio, fim: c.contrato_fim, status: us.some(u => u.status === 'em_risco') ? 'em_risco' : c.status,
      docs: new Set(dados.documentos.filter(d => us.some(u => u.id === d.cliente_id)).map(d => d.nome)).size,
      entregas: dados.tarefas.filter(t => t.status !== 'feita' && us.some(u => u.id === t.cliente_id)).length,
      acao: us.find(u => u.proxima_acao) };
  }).sort((a, b) => b.valor - a.valor);
}

/* ---------- Pedaços de tela ---------- */
const nomeCliente = id => dados.clientes.find(c => c.id === id)?.nome;

function linhaTarefa(t, diaEstrela = hoje()) {
  const atrasada = t.status !== 'feita' && t.vencimento && t.vencimento < hoje();
  const estrela = t.prioridade_em === diaEstrela;
  const info = [t.frente ? FRENTES[t.frente] : 'Caixa de entrada', nomeCliente(t.cliente_id), t.vencimento ? 'Prazo ' + fmtData(t.vencimento) : ''].filter(Boolean).join(' · ');
  return `<li class="linha ${t.status === 'feita' ? 'feita' : ''}">
    <input type="checkbox" data-acao="concluir" data-id="${t.id}" ${t.status === 'feita' ? 'checked' : ''} aria-label="Concluir: ${esc(t.titulo)}">
    <div class="corpo clicavel" data-acao="editar" data-tabela="tarefas" data-id="${t.id}" role="button" tabindex="0"><b>${esc(t.titulo)}</b><small>${esc(info)}${atrasada ? ' · <span class="alerta">Atrasada</span>' : ''}</small></div>
    <button class="estrela" data-acao="estrela" data-id="${t.id}" data-dia="${diaEstrela}" aria-pressed="${estrela}" aria-label="${estrela ? 'Tirar das prioridades' : 'Marcar como prioridade'}" title="${estrela ? 'Tirar das prioridades' : 'Marcar como prioridade'}">${estrela ? '★' : '☆'}</button>
  </li>`;
}

const lista = (itens, render, vazio = '') => itens.length ? `<ul class="lista">${itens.map(render).join('')}</ul>` : `<p class="vazio">${esc(vazio)}</p>`;
const svgIcone = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[k] || ICONES.geral}</svg>`;
const kpi = (rotulo, valor, nota = '', classe = '', icone = '') => `<div class="kpi ${classe}">${icone ? `<div class="icone">${svgIcone(icone)}</div>` : ''}<span>${esc(rotulo)}</span><strong>${esc(valor)}</strong><small>${typeof nota === 'object' ? nota.html : esc(nota)}</small></div>`;

/* ---------- Gráficos (SVG e HTML puros, sem biblioteca) ---------- */
const CORES = ['var(--g1)', 'var(--g2)', 'var(--g3)', 'var(--g4)', 'var(--g5)', 'var(--g6)'];
const moedaCurta = v => Math.abs(v) >= 1000 ? 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mil' : moeda(v);

// Rosca: fatias [{rotulo, valor}], com o total no meio e legenda ao lado
function rosca(fatias, centro, sub, fmt = v => String(v)) {
  const total = fatias.reduce((s, f) => s + f.valor, 0);
  const r = 46, c = 2 * Math.PI * r;
  let acumulado = 0;
  const arcos = total ? fatias.map((f, i) => {
    const parte = f.valor / total * c;
    const arco = `<circle cx="60" cy="60" r="${r}" fill="none" stroke="${CORES[i % CORES.length]}" stroke-width="13" stroke-dasharray="${Math.max(parte - 2, 0.01)} ${c}" stroke-dashoffset="${-acumulado}" transform="rotate(-90 60 60)" stroke-linecap="butt"/>`;
    acumulado += parte;
    return arco;
  }).join('') : '';
  return `<div class="grafico">
    <svg class="rosca" viewBox="0 0 120 120" role="img" aria-label="${esc(sub)}: ${esc(centro)}">
      <circle cx="60" cy="60" r="${r}" fill="none" stroke="var(--barra-vazia)" stroke-width="13"/>${arcos}
      <text x="60" y="58" text-anchor="middle" font-size="14" font-weight="700">${esc(centro)}</text>
      <text x="60" y="75" text-anchor="middle" font-size="9.5" opacity=".6">${esc(sub)}</text>
    </svg>
    <ul class="legenda">${fatias.map((f, i) => `<li><i style="background:${CORES[i % CORES.length]}"></i><span>${esc(f.rotulo)}</span><b>${esc(fmt(f.valor))}</b></li>`).join('')}</ul>
  </div>`;
}

// Barras verticais: [{rotulo, valor, destaque}]
function barras(itens, fmt = v => String(v)) {
  const max = Math.max(1, ...itens.map(i => i.valor));
  return `<div class="barras">${itens.map(i => `<div class="barra ${i.destaque ? 'destaque' : ''}">
    <div class="coluna-barra"><div style="height:${Math.max(i.valor / max * 100, 3)}%">${i.valor ? `<em>${esc(fmt(i.valor))}</em>` : ''}</div></div>
    <small>${esc(i.rotulo)}</small></div>`).join('')}</div>`;
}

// Barras duplas (entradas x saídas): [{rotulo, entrada, saida}]
function barrasDuplas(itens) {
  const max = Math.max(1, ...itens.flatMap(i => [i.entrada, i.saida]));
  return `<div class="barras duplas">${itens.map(i => `<div class="barra">
    <div class="coluna-barra"><div class="entrada" style="height:${Math.max(i.entrada / max * 100, 2)}%" title="Entradas ${moeda(i.entrada)}"></div><div class="saida" style="height:${Math.max(i.saida / max * 100, 2)}%" title="Saídas ${moeda(i.saida)}"></div></div>
    <small>${esc(i.rotulo)}</small></div>`).join('')}</div>`;
}

// Anel de progresso (0 a 1)
function anel(fracao, texto, tamanho = 104) {
  const r = 40, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, fracao || 0));
  return `<svg class="anel" width="${tamanho}" height="${tamanho}" viewBox="0 0 100 100" role="img" aria-label="${Math.round(f * 100)}%">
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="rgba(255,255,255,.22)" stroke-width="9"/>
    <circle cx="50" cy="50" r="${r}" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-dasharray="${f * c} ${c}" transform="rotate(-90 50 50)"/>
    <text x="50" y="56" text-anchor="middle" font-size="19" font-weight="700">${esc(texto)}</text>
  </svg>`;
}

// Linha com barra de progresso: rótulo, valor e fração
const metrica = (rotulo, valor, fracao, classe = '') => `<div class="metrica ${classe}"><div class="rotulo"><span>${esc(rotulo)}</span><b>${esc(valor)}</b></div><div class="progresso"><div style="width:${Math.max(0, Math.min(100, fracao * 100))}%"></div></div></div>`;
const diaSemanaCurto = iso => new Intl.DateTimeFormat('pt-BR', { weekday: 'short', timeZone: 'UTC' }).format(new Date(iso + 'T12:00:00Z')).replace('.', '');

/* ---------- Componentes visuais novos ---------- */
// Variação contra o mês anterior. "menorEhMelhor" para custos e gastos.
// No mês em andamento, compara com o mesmo período do mês anterior (até o mesmo dia).
const comparacao = m => m === hoje().slice(0, 7) ? { n: numeros(somarMes(m, -1), hoje().slice(8, 10)), r: `vs mesmo período de ${rotuloMes(somarMes(m, -1))}` }
  : { n: numeros(somarMes(m, -1)), r: `vs ${rotuloMes(somarMes(m, -1))}` };
function delta(atual, anterior, menorEhMelhor = false, rotulo = 'vs mês anterior', emReais = false) {
  if (!anterior && !emReais) return '';
  const dif = atual - anterior;
  if (Math.abs(dif) < 0.5) return `<span class="delta">igual</span> ${rotulo}`;
  const bom = menorEhMelhor ? dif < 0 : dif > 0;
  const quanto = emReais ? moedaCurta(Math.abs(dif)) : Math.round(Math.abs(dif) / Math.abs(anterior) * 100) + '%';
  return `<span class="delta ${bom ? 'bom' : 'ruim'}">${dif > 0 ? '↑' : '↓'} ${quanto}</span> ${rotulo}`;
}

// Linha suave com área preenchida: [{rotulo, valor}] (aceita negativos; linha tracejada no zero)
function area(pontos, fmt = moedaCurta) {
  const W = 600, H = 190, pe = 26, topoPad = 22, lado = 18;
  const vals = pontos.map(p => p.valor);
  const max = Math.max(0, ...vals), min = Math.min(0, ...vals);
  const span = (max - min) || 1;
  const x = i => lado + i * ((W - lado * 2) / Math.max(1, pontos.length - 1));
  const y = v => topoPad + (max - v) / span * (H - pe - topoPad);
  const pts = pontos.map((p, i) => [x(i), y(p.valor)]);
  const curva = pts.map((p, i) => {
    if (!i) return `M${p[0]},${p[1]}`;
    const a = pts[i - 1], cx = (a[0] + p[0]) / 2;
    return `C${cx},${a[1]} ${cx},${p[1]} ${p[0]},${p[1]}`;
  }).join(' ');
  const zero = y(0);
  const id = 'g' + Math.random().toString(36).slice(2, 8);
  return `<svg class="area" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução mês a mês">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--acento)" stop-opacity=".28"/><stop offset="1" stop-color="var(--acento)" stop-opacity="0"/></linearGradient></defs>
    ${[0.25, 0.5, 0.75].map(f => `<line class="grade-linha" x1="0" x2="${W}" y1="${topoPad + f * (H - pe - topoPad)}" y2="${topoPad + f * (H - pe - topoPad)}"/>`).join('')}
    <line class="zero" x1="0" x2="${W}" y1="${zero}" y2="${zero}"/>
    <path d="${curva} L${pts[pts.length - 1][0]},${zero} L${pts[0][0]},${zero} Z" fill="url(#${id})"/>
    <path d="${curva}" fill="none" stroke="var(--acento)" stroke-width="3" stroke-linecap="round" vector-effect="non-scaling-stroke"/>
    ${pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="4.5" fill="var(--superficie)" stroke="${pontos[i].valor < 0 ? 'var(--g4)' : 'var(--acento)'}" stroke-width="2.5" vector-effect="non-scaling-stroke"/>
      <text class="valor-ponto" x="${p[0]}" y="${p[1] - 10}" text-anchor="middle">${esc(fmt(pontos[i].valor))}</text>
      <text class="rotulo" x="${p[0]}" y="${H - 6}" text-anchor="middle">${esc(pontos[i].rotulo)}</text>`).join('')}
  </svg>`;
}

// Medidor em semicírculo (0 a 1)
function medidor(fracao, texto, legenda, cor = 'var(--acento)') {
  const f = Math.max(0, Math.min(1, fracao || 0));
  const r = 80, c = Math.PI * r;
  return `<div class="medidor"><svg viewBox="0 0 200 118" role="img" aria-label="${esc(texto)}">
    <path class="base" d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke-width="16" stroke-linecap="round"/>
    <path d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke="${cor}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${f * c} ${c}"/>
    <text x="100" y="92" text-anchor="middle" font-size="30" font-weight="700">${esc(texto)}</text>
  </svg><p>${esc(legenda)}</p></div>`;
}

// Calendário do mês, com bolinha nos dias que têm compromisso ou prazo
function calendario(mes) {
  const primeiro = new Date(mes + '-01T12:00:00Z');
  const inicio = (primeiro.getUTCDay() + 6) % 7; // semana começa na segunda
  const diasNoMes = new Date(Date.UTC(primeiro.getUTCFullYear(), primeiro.getUTCMonth() + 1, 0)).getUTCDate();
  const marcados = new Set([...dados.agenda_eventos.map(e => diaDe(e.inicio)), ...dados.tarefas.filter(t => t.status !== 'feita' && t.vencimento).map(t => t.vencimento)]);
  const celulas = [];
  for (let i = 0; i < inicio; i++) celulas.push('<div class="d fora"></div>');
  for (let d = 1; d <= diasNoMes; d++) {
    const iso = `${mes}-${String(d).padStart(2, '0')}`;
    celulas.push(`<div class="d ${iso === hoje() ? 'hoje' : ''} ${marcados.has(iso) ? 'marcado' : ''}">${d}</div>`);
  }
  return `<div class="calendario">${['S', 'T', 'Q', 'Q', 'S', 'S', 'D'].map(s => `<div class="sem">${s}</div>`).join('')}${celulas.join('')}</div>`;
}

// Bolinha com iniciais, colorida pela categoria (lista de transações)
const CORES_AVATAR = [['--t-lilas', '--c-lilas'], ['--t-menta', '--c-menta'], ['--t-ambar', '--c-ambar'], ['--t-rosa', '--c-rosa'], ['--t-azul', '--c-azul']];
function avatar(texto, chave) {
  let h = 0; for (const ch of String(chave || texto)) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const [f, c] = CORES_AVATAR[h % CORES_AVATAR.length];
  const iniciais = String(texto).replace(/^(Pix para|Recebido de|Compra no débito -|Pagamento efetuado -)\s*/i, '').trim().split(/\s+/).filter(p => /[\p{L}\d]/u.test(p)).slice(0, 2).map(p => (p.match(/[\p{L}\d]/u) || [''])[0]).join('').toUpperCase();
  return `<span class="avatar" style="background:var(${f});color:var(${c})">${esc(iniciais || '•')}</span>`;
}
const linhaTransacao = l => `<li class="linha">${avatar(l.descricao, l.categoria)}<div class="corpo"><b>${esc(l.descricao)}</b><small>${fmtData(l.vencimento)} · ${esc(l.categoria || 'Sem categoria')}</small></div>
  <span class="valor ${l.tipo === 'entrada' ? 'positivo' : ''}">${l.tipo === 'entrada' ? '+' : '−'} ${moeda(l.valor)}</span></li>`;

function aplicarTema() {
  const escuro = document.documentElement.dataset.theme === 'dark';
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', escuro ? '#0d0e13' : '#eef0f6');
  const b = $('botao-tema');
  if (b) b.innerHTML = escuro
    ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.900 4.900l1.400 1.400M17.700 17.700l1.400 1.400M2 12h2M20 12h2M4.900 19.100l1.400-1.400M17.700 6.300l1.400-1.400"/></svg><span>Modo claro</span>'
    : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.800A9 9 0 1 1 11.200 3a7 7 0 0 0 9.800 9.800Z"/></svg><span>Modo escuro</span>';
}

/* ---------- Números do mês (mesma lógica do importar.py) ---------- */
const A_CLASSIFICAR = ['Sem categoria', 'Pix enviado (a classificar)', 'Recebido via Pix (a classificar)'];
const mesAtual = () => ui.mes || hoje().slice(0, 7);
const rotuloMes = m => new Intl.DateTimeFormat('pt-BR', { month: 'short', timeZone: 'UTC' }).format(new Date(m + '-15T12:00:00Z')).replace('.', '');
const ultimosMeses = (m, n = 6) => Array.from({ length: n }, (_, i) => somarMes(m, i - n + 1));
const somaV = itens => itens.reduce((s, l) => s + Number(l.valor), 0);
const tipoConta = c => /^Cartão/i.test(c.nome) ? 'cartao' : /^(Caixinha|ETF|Investimento)/i.test(c.nome) ? 'investimento' : 'conta';
const ehRetirada = l => /^Retirada/.test(l.categoria || '');
const ehPessoalPeloPJ = l => l.escopo === 'empresa' && l.tipo === 'saida' && /^Pessoal pago pela empresa/.test(l.categoria || '');
const ehClienteNoPessoal = l => l.escopo === 'pessoal' && l.tipo === 'entrada' && /^Cliente da agência/.test(l.categoria || '');

// Agência = receita do PJ + clientes que pagam no pessoal − custos do PJ (sem retirada e sem gasto pessoal pago pelo PJ).
// Pessoal = retirada + outras entradas − gastos (gasto pessoal pago pelo PJ conta aqui; reembolso desconta).
function numeros(m, ateDia = null) {
  const L = dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === m && (!ateDia || l.vencimento.slice(8, 10) <= ateDia));
  const catGasto = new Set(dados.lancamentos.filter(l => l.escopo === 'pessoal' && l.tipo === 'saida' && l.categoria !== 'Família').map(l => l.categoria));
  const ehReembolso = l => l.escopo === 'pessoal' && l.tipo === 'entrada' && !ehRetirada(l) && !ehClienteNoPessoal(l) && catGasto.has(l.categoria);
  const receita = somaV(L.filter(l => l.escopo === 'empresa' && l.tipo === 'entrada')) + somaV(L.filter(ehClienteNoPessoal));
  const custosItens = L.filter(l => l.escopo === 'empresa' && l.tipo === 'saida' && !ehRetirada(l) && !ehPessoalPeloPJ(l));
  const pessoalPJItens = L.filter(ehPessoalPeloPJ);
  const reembolsos = L.filter(ehReembolso);
  const gastosItens = [...L.filter(l => l.escopo === 'pessoal' && l.tipo === 'saida'), ...pessoalPJItens];
  const custo = somaV(custosItens), reembolsoV = somaV(reembolsos);
  const gastos = somaV(gastosItens) - reembolsoV;
  const outras = somaV(L.filter(l => l.escopo === 'pessoal' && l.tipo === 'entrada' && !ehRetirada(l) && !ehClienteNoPessoal(l) && !ehReembolso(l)));
  const retirada = somaV(L.filter(l => l.escopo === 'pessoal' && l.tipo === 'entrada' && ehRetirada(l)));
  return { L, receita, custo, lucro: receita - custo, outras, retirada, pessoalPJ: somaV(pessoalPJItens), gastos, reembolsos, reembolsoV,
    resultado: receita - custo + outras - gastos, custosItens, gastosItens };
}

function patrimonio() {
  const ativas = dados.contas.filter(c => c.ativa);
  const soma = f => ativas.filter(f).reduce((s, c) => s + Number(c.saldo), 0);
  return {
    total: soma(() => true), pessoal: soma(c => c.escopo === 'pessoal'), empresa: soma(c => c.escopo === 'empresa'),
    conta: soma(c => tipoConta(c) === 'conta'), contaPessoal: soma(c => tipoConta(c) === 'conta' && c.escopo === 'pessoal'),
    contaEmpresa: soma(c => tipoConta(c) === 'conta' && c.escopo === 'empresa')
  };
}

// Agrupa por categoria (descontando reembolsos da mesma categoria); 5 maiores + "Outras"
function porCategoria(itens, menos = []) {
  const t = {};
  itens.forEach(l => { const k = l.categoria || 'Sem categoria'; t[k] = (t[k] || 0) + Number(l.valor); });
  menos.forEach(l => { if (t[l.categoria] !== undefined) t[l.categoria] -= Number(l.valor); });
  const ord = Object.entries(t).filter(([, v]) => v > 0.005).sort((a, b) => b[1] - a[1]);
  const top = ord.slice(0, 5).map(([rotulo, valor]) => ({ rotulo, valor }));
  const resto = ord.slice(5).reduce((s, [, v]) => s + v, 0);
  if (resto) top.push({ rotulo: `Outras (${ord.length - 5})`, valor: resto });
  return top;
}

const seletorMes = () => `<div class="seletor-mes"><button class="btn pequeno" data-acao="mes" data-valor="-1" aria-label="Mês anterior">‹</button>
  <span>${esc(nomeMes(mesAtual()))}</span><button class="btn pequeno" data-acao="mes" data-valor="1" aria-label="Próximo mês">›</button></div>`;
const legendaDupla = (a, b) => `<ul class="legenda legenda-linha"><li><i style="background:var(--g1)"></i><span>${esc(a)}</span></li><li><i style="background:var(--saida)"></i><span>${esc(b)}</span></li></ul>`;
const botaoTemaCelular = () => `<button class="btn icone so-celular" data-acao="tema" aria-label="Trocar entre claro e escuro">${document.documentElement.dataset.theme === 'dark' ? '☀︎' : '☾'}</button>`;
const topo = (titulo, sub, acoes = '') => `<div class="topo"><div><h1>${esc(titulo)}</h1><p>${esc(sub)}</p></div><div class="acoes">${acoes}${botaoTemaCelular()}</div></div>`;
const botaoNovo = (tabela, rotulo, padrao = '') => `<button class="btn azul" data-acao="novo" data-tabela="${tabela}" data-padrao='${esc(padrao)}'>${esc(rotulo)}</button>`;

function linhaLancamento(l) {
  const vencido = !l.pago && l.vencimento < hoje();
  const info = [fmtData(l.vencimento), l.categoria, nomeCliente(l.cliente_id), ESCOPOS[l.escopo]].filter(Boolean).join(' · ');
  return `<li class="linha">
    <input type="checkbox" data-acao="pagar" data-id="${l.id}" ${l.pago ? 'checked' : ''} aria-label="Marcar como pago: ${esc(l.descricao)}">
    <div class="corpo clicavel" data-acao="editar" data-tabela="lancamentos" data-id="${l.id}" role="button" tabindex="0"><b>${esc(l.descricao)}</b><small>${esc(info)}${vencido ? ' · <span class="negativo">Vencido</span>' : ''}</small></div>
    <span class="valor ${l.tipo === 'entrada' ? 'positivo' : ''}">${l.tipo === 'entrada' ? '+' : '−'} ${moeda(l.valor)}</span>
  </li>`;
}

function linhaEvento(ev) {
  return `<li class="linha"><span class="hora">${ev.dia_inteiro ? 'Dia todo' : horaDe(ev.inicio) + (ev.fim ? '–' + horaDe(ev.fim) : '')}</span><div class="corpo"><b>${esc(ev.titulo)}</b><small>${esc(ev.calendario)}</small></div></li>`;
}

const eventosDoDia = dia => dados.agenda_eventos.filter(e => (e.dia_inteiro ? e.inicio.slice(0, 10) === dia || diaDe(e.inicio) === dia : diaDe(e.inicio) === dia))
  .sort((a, b) => a.inicio.localeCompare(b.inicio));
const clienteAberto = c => c.status === 'ativo' || c.status === 'em_risco';
const semContato = c => clienteAberto(c) && (!c.ultimo_contato || diasEntre(c.ultimo_contato, hoje()) > DIAS_SEM_CONTATO);
const leadAberto = l => l.etapa !== 'ganho' && l.etapa !== 'perdido';

/* ---------- Telas ---------- */
const TELA = {
  /* ---------- Visão geral: agência + pessoal juntos ---------- */
  geral() {
    const d = hoje(), m = mesAtual(), n = numeros(m), cmp = comparacao(m), a = cmp.n;
    const amanha = somarDias(d, 1);
    const abertas = dados.tarefas.filter(t => t.status !== 'feita');
    const prioridades = dados.tarefas.filter(t => t.prioridade_em === d);
    const atrasadas = abertas.filter(t => t.vencimento && t.vencimento < d);
    const pat = patrimonio();
    const parados = dados.clientes.filter(semContato).sort((x, y) => (x.ultimo_contato || '').localeCompare(y.ultimo_contato || ''));
    const pend = dados.lancamentos.filter(l => A_CLASSIFICAR.includes(l.categoria));
    const base = inicioSemana(d);
    const daSemana = dados.tarefas.filter(t => (t.concluida_em && diaDe(t.concluida_em) >= base) || (t.status !== 'feita' && (t.prioridade_em >= base || (t.vencimento && t.vencimento >= base && t.vencimento <= somarDias(base, 6)))));
    const feitasSemana = daSemana.filter(t => t.status === 'feita').length;
    const hora = Number(new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, hour: 'numeric', hour12: false }).format(new Date()));
    const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';
    const dataLonga = new Intl.DateTimeFormat('pt-BR', { timeZone: FUSO, weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
    const maxW = Math.max(n.receita, n.custo, n.outras, n.gastos, 1);
    const eventos = [...eventosDoDia(d).map(e => ({ ...e, quando: 'Hoje' })), ...eventosDoDia(amanha).map(e => ({ ...e, quando: 'Amanhã' }))];
    return `<div class="topo"><div><h1>${saudacao}, <em>Otávio</em></h1><p>${esc(dataLonga)} · veja como estão a agência e a sua vida</p></div><div class="acoes">${seletorMes()}${botaoTemaCelular()}</div></div>
      <form class="captura" data-form="captura"><input name="titulo" placeholder="O que surgiu? Anote aqui e vai para a Caixa de entrada" aria-label="Anotar"><button class="btn azul">Anotar</button></form>
      <div class="grade kpis">
        ${kpi('Resultado do mês', (n.resultado < 0 ? '− ' : '+ ') + moeda(Math.abs(n.resultado)), { html: delta(n.resultado, a.resultado, false, cmp.r, true) }, '', 'carteira')}
        ${kpi('Receita da agência', moeda(n.receita), { html: delta(n.receita, a.receita, false, cmp.r) }, '', 'agencia')}
        ${kpi('Gastos pessoais', moeda(n.gastos), { html: delta(n.gastos, a.gastos, true, cmp.r) }, '', 'pessoal')}
        ${kpi('Patrimônio', moedaCurta(pat.total), 'Contas, caixinhas e ETFs', '', 'subir')}
      </div>
      <div class="grade painel bloco-espaco">
        <section class="cartao"><h2>Resultado mês a mês <small><button class="btn pequeno" data-acao="ir" data-valor="historico">Ver histórico</button></small></h2>
          ${area(ultimosMeses(m).map(x => ({ rotulo: rotuloMes(x), valor: numeros(x).resultado })))}</section>
        <section class="cartao"><h2>${esc(nomeMes(d.slice(0, 7)))} <small>${eventos.length} compromisso(s)</small></h2>
          ${calendario(d.slice(0, 7))}
          <div style="margin-top:14px">${lista(eventos, e => `<li class="linha"><span class="hora">${e.quando}<br>${e.dia_inteiro ? 'Dia todo' : horaDe(e.inicio)}</span><div class="corpo"><b>${esc(e.titulo)}</b></div></li>`, 'Sem compromissos hoje e amanhã.')}</div></section>
      </div>
      <div class="grade painel">
        <div class="grade">
          <section class="cartao"><h2>Como o mês fechou <small>${esc(nomeMes(m))}</small></h2>
            ${metrica('Receita da agência', '+ ' + moeda(n.receita), n.receita / maxW, 'verde')}
            ${metrica('Custos da agência', '− ' + moeda(n.custo), n.custo / maxW, 'saida')}
            ${metrica('Outras entradas (aluguel, família...)', '+ ' + moeda(n.outras), n.outras / maxW, 'verde')}
            ${metrica('Seus gastos pessoais', '− ' + moeda(n.gastos), n.gastos / maxW, 'saida')}</section>
          <section class="cartao"><h2>Prioridades de hoje <small>${prioridades.filter(t => t.status === 'feita').length} de ${prioridades.length || 3}</small></h2>
            ${lista(prioridades, t => linhaTarefa(t, d), 'Nada escolhido. Em Tarefas, marque até 3 com a estrela.')}
            ${atrasadas.length ? `<h3 class="subtitulo" style="margin-top:16px">Atrasadas (${atrasadas.length})</h3>${lista(atrasadas.slice(0, 5), t => linhaTarefa(t, d))}` : ''}</section>
        </div>
        <div class="grade">
          <section class="cartao"><h2>Tarefas da semana</h2>${medidor(daSemana.length ? feitasSemana / daSemana.length : 0, daSemana.length ? Math.round(feitasSemana / daSemana.length * 100) + '%' : '0%', `${feitasSemana} de ${daSemana.length} feitas · ${abertas.length} em aberto no total`)}</section>
          <section class="cartao"><h2>Precisa de atenção</h2>
            ${lista([
              ...(pend.length ? [{ ir: 'lancamentos', n: `${pend.length} lançamento(s) sem categoria`, s: 'Toque para ver e classificar', selo: 'Finanças', cor: 'ambar' }] : []),
              ...parados.slice(0, 4).map(c => ({ t: 'clientes', id: c.id, n: c.nome, s: c.ultimo_contato ? `Sem contato há ${diasEntre(c.ultimo_contato, d)} dias` : 'Contato não registrado', selo: 'Cliente', cor: 'azul' }))
            ], x => `<li class="linha clicavel" ${x.ir ? `data-acao="ir" data-valor="${x.ir}" data-filtro="classificar"` : `data-acao="editar" data-tabela="${x.t}" data-id="${x.id}"`}><div class="corpo"><b>${esc(x.n)}</b><small>${esc(x.s)}</small></div><span class="selo ${x.cor}">${x.selo}</span></li>`, 'Nada pendente.')}</section>
        </div>
      </div>`;
  },

  /* ---------- Histórico mês a mês ---------- */
  historico() {
    const atual = hoje().slice(0, 7);
    // Começa no 1º mês com extrato de verdade (meses com 1 ou 2 lançamentos soltos ficam de fora)
    const porMes = {}; dados.lancamentos.forEach(l => { const x = l.vencimento.slice(0, 7); porMes[x] = (porMes[x] || 0) + 1; });
    const primeiro = Object.keys(porMes).filter(x => x <= atual && porMes[x] >= 10).sort()[0] || atual;
    let meses = []; for (let x = primeiro; x <= atual; x = somarMes(x, 1)) meses.push(x);
    const p = ui.periodo;
    meses = p === 'ano' ? meses.filter(x => x.slice(0, 4) === atual.slice(0, 4)) : p === 'tudo' ? meses : meses.slice(-Number(p));
    const v = ui.visao;
    const COL = {
      tudo: { titulo: 'Resultado', principal: k => k.resultado, ent: k => k.receita + k.outras, sai: k => k.custo + k.gastos,
        cols: [['Receita agência', k => k.receita, '+'], ['Custos agência', k => k.custo, '−'], ['Outras entradas', k => k.outras, '+'], ['Gastos pessoais', k => k.gastos, '−']] },
      agencia: { titulo: 'Lucro', principal: k => k.lucro, ent: k => k.receita, sai: k => k.custo,
        cols: [['Receita', k => k.receita, '+'], ['Custos', k => k.custo, '−'], ['Margem', k => k.receita ? k.lucro / k.receita : 0, '%']] },
      pessoal: { titulo: 'Sobrou', principal: k => k.retirada + k.pessoalPJ + k.outras - k.gastos, ent: k => k.retirada + k.pessoalPJ + k.outras, sai: k => k.gastos,
        cols: [['Entrou', k => k.retirada + k.pessoalPJ + k.outras, '+'], ['Gastou', k => k.gastos, '−']] }
    }[v];
    const linhas = meses.map(x => { const k = numeros(x); return { m: x, k, valor: COL.principal(k) }; });
    const fechados = linhas.filter(l => l.m !== atual);
    const base = fechados.length ? fechados : linhas;
    const total = linhas.reduce((s, l) => s + l.valor, 0);
    const media = base.reduce((s, l) => s + l.valor, 0) / (base.length || 1);
    const melhor = base.reduce((a, b) => b.valor > a.valor ? b : a, base[0]);
    const pior = base.reduce((a, b) => b.valor < a.valor ? b : a, base[0]);
    const sinal = x => (x < 0 ? '− ' : '+ ') + moeda(Math.abs(x));
    const fmtCol = (tipo, x) => tipo === '%' ? Math.round(x * 100) + '%' : moeda(x);
    const pil = (acao, val, rot, atualV) => `<button class="pilula" data-acao="${acao}" data-valor="${val}" aria-pressed="${atualV === val}">${esc(rot)}</button>`;
    const nomeM = x => `${rotuloMes(x)}/${x.slice(2, 4)}`;
    return topo('Histórico', 'Como cada mês fechou. Clique num mês para ver os detalhes.') + `
      <div class="filtros-historico">
        <div class="pilulas">${pil('visao', 'tudo', 'Tudo', v)}${pil('visao', 'agencia', 'Agência', v)}${pil('visao', 'pessoal', 'Pessoal', v)}</div>
        <div class="pilulas">${pil('periodo', '6', '6 meses', p)}${pil('periodo', '12', '12 meses', p)}${pil('periodo', 'ano', 'Este ano', p)}${pil('periodo', 'tudo', 'Desde o início', p)}</div>
      </div>
      <div class="grade kpis">
        ${kpi(`${COL.titulo} no período`, sinal(total), `${linhas.length} mês(es)${linhas.some(l => l.m === atual) ? ', com o mês atual' : ''}`, 'destaque', 'carteira')}
        ${kpi('Média por mês', sinal(media), fechados.length ? 'Só meses fechados' : 'Mês em andamento', '', 'historico')}
        ${kpi('Melhor mês', melhor ? nomeM(melhor.m) : '—', melhor ? sinal(melhor.valor) : '', '', 'subir')}
        ${kpi('Pior mês', pior ? nomeM(pior.m) : '—', pior ? sinal(pior.valor) : '', '', 'descer')}
      </div>
      <div class="grade duas bloco-espaco">
        <section class="cartao"><h2>${COL.titulo} mês a mês</h2>${area(linhas.map(l => ({ rotulo: rotuloMes(l.m), valor: l.valor })))}</section>
        <section class="cartao"><h2>Entradas x saídas</h2>${barrasDuplas(linhas.map(l => ({ rotulo: rotuloMes(l.m), entrada: COL.ent(l.k), saida: COL.sai(l.k) })))}${legendaDupla('Entradas', 'Saídas')}</section>
      </div>
      <section class="cartao"><h2>Mês a mês</h2>
        <div class="tabela-rolagem"><table class="tabela-clientes tabela-historico">
          <thead><tr><th>Mês</th>${COL.cols.map(c => `<th class="num">${esc(c[0])}</th>`).join('')}<th class="num">${COL.titulo}</th></tr></thead>
          <tbody>${linhas.slice().reverse().map(l => `<tr class="clicavel" data-acao="abrir-mes" data-valor="${l.m}" role="button" tabindex="0">
            <td><b>${esc(nomeM(l.m))}</b>${l.m === atual ? ' <small class="fraco">até hoje</small>' : ''}</td>
            ${COL.cols.map(c => `<td class="num">${fmtCol(c[2], c[1](l.k))}</td>`).join('')}
            <td class="num"><b class="${l.valor < 0 ? 'negativo' : 'positivo'}">${sinal(l.valor)}</b></td></tr>`).join('')}</tbody>
          <tfoot><tr><td><b>Total</b></td>${COL.cols.map(c => `<td class="num">${c[2] === '%' ? '' : moeda(linhas.reduce((s, l) => s + c[1](l.k), 0))}</td>`).join('')}<td class="num"><b class="${total < 0 ? 'negativo' : 'positivo'}">${sinal(total)}</b></td></tr></tfoot>
        </table></div>
      </section>`;
  },

  /* ---------- Agência ---------- */
  agencia() {
    const m = mesAtual(), n = numeros(m), cmp = comparacao(m), a = cmp.n, d = hoje();
    const abertos = dados.clientes.filter(clienteAberto).sort((x, y) => y.valor_mensal - x.valor_mensal);
    const contratada = abertos.reduce((s, c) => s + Number(c.valor_mensal), 0);
    const serie = ultimosMeses(m).map(x => { const k = numeros(x); return { rotulo: rotuloMes(x), entrada: k.receita, saida: k.custo }; });
    const entradas = n.L.filter(l => (l.escopo === 'empresa' && l.tipo === 'entrada') || ehClienteNoPessoal(l)).sort((x, y) => y.valor - x.valor);
    const tarefas = dados.tarefas.filter(t => t.status !== 'feita' && t.frente === 'agencia').sort((x, y) => (x.vencimento || '9999').localeCompare(y.vencimento || '9999'));
    const margem = n.receita ? n.lucro / n.receita : 0;
    const recebidoDoContratado = contratada ? n.receita / contratada : 0;
    return topo('Agência Impulsionar Pro', `Números de ${nomeMes(m)}`, seletorMes()) + `
      <div class="grade kpis">
        ${kpi('Receita do mês', moeda(n.receita), { html: delta(n.receita, a.receita, false, cmp.r) }, '', 'carteira')}
        ${kpi('Lucro', moeda(n.lucro), { html: delta(n.lucro, a.lucro, false, cmp.r) }, '', 'subir')}
        ${kpi('Custos do mês', moeda(n.custo), { html: delta(n.custo, a.custo, true, cmp.r) }, '', 'descer')}
        ${kpi('Receita contratada', moeda(contratada), `${abertos.length} cliente(s) ativo(s) por mês`, '', 'clientes')}
      </div>
      <div class="grade painel bloco-espaco">
        <section class="cartao"><h2>Receita x custos <small>últimos 6 meses</small></h2>${barrasDuplas(serie)}${legendaDupla('Receita', 'Custos')}</section>
        <section class="cartao"><h2>Margem de lucro <small>${esc(nomeMes(m))}</small></h2>
          ${medidor(margem, Math.round(margem * 100) + '%', `De cada R$ 100 que entram, sobram R$ ${Math.max(0, Math.round(margem * 100))}`, 'var(--g2)')}
          ${metrica('Recebido do contratado', `${moedaCurta(n.receita)} de ${moedaCurta(contratada)}`, recebidoDoContratado)}</section>
      </div>
      <div class="grade duas bloco-espaco">
        ${cartaoCompromissos('empresa', m)}
        <div class="grade">
          <section class="cartao"><h2>Para onde foram os custos <small>${moedaCurta(n.custo)}</small></h2>
            ${n.custosItens.length ? rosca(porCategoria(n.custosItens), moedaCurta(n.custo), 'custos', moedaCurta) : '<p class="vazio">Sem custos neste mês.</p>'}</section>
          <section class="cartao"><h2>Recebido no mês <small>${moedaCurta(n.receita)}</small></h2>
            ${lista(entradas, l => `<li class="linha">${avatar(l.descricao, l.descricao)}<div class="corpo"><b>${esc(l.descricao.replace(/^Recebido de /, ''))}</b><small>${fmtData(l.vencimento)}${l.escopo === 'pessoal' ? ' · caiu na conta pessoal' : ''}</small></div><span class="valor positivo">+ ${moeda(l.valor)}</span></li>`, 'Nada recebido neste mês.')}</section>
        </div>
      </div>
      <section class="cartao"><h2>Tarefas da agência <small>${tarefas.length} em aberto</small></h2>${lista(tarefas.slice(0, 10), t => linhaTarefa(t), 'Nenhuma tarefa em aberto.')}</section>`;
  },

  /* ---------- Pessoal ---------- */
  pessoal() {
    const m = mesAtual(), n = numeros(m), cmp = comparacao(m), a = cmp.n;
    const pat = patrimonio();
    const entrou = n.retirada + n.pessoalPJ + n.outras, entrouAnt = a.retirada + a.pessoalPJ + a.outras;
    const resultado = entrou - n.gastos;
    const ultimos = n.L.filter(l => l.escopo === 'pessoal' || ehPessoalPeloPJ(l)).sort((x, y) => y.vencimento.localeCompare(x.vencimento)).slice(0, 8);
    const contasP = dados.contas.filter(c => c.ativa && c.escopo === 'pessoal').sort((x, y) => y.saldo - x.saldo);
    const maxConta = Math.max(1, ...contasP.map(c => Math.abs(c.saldo)));
    const tarefas = dados.tarefas.filter(t => t.status !== 'feita' && (t.frente === 'vida_pessoal' || t.frente === 'casamento'));
    const reserva = contasP.filter(c => /Reserva/i.test(c.nome)).reduce((s, c) => s + Number(c.saldo), 0);
    const mediaGastos = ultimosMeses(somarMes(m, -1), 3).reduce((s, x) => s + numeros(x).gastos, 0) / 3 || n.gastos || 1;
    const mesesReserva = reserva / mediaGastos;
    return topo('Pessoal', `Sua vida financeira em ${nomeMes(m)}`, seletorMes()) + `
      <div class="grade kpis">
        ${kpi('Entrou no mês', moeda(entrou), { html: delta(entrou, entrouAnt, false, cmp.r) }, '', 'subir')}
        ${kpi('Gastou no mês', moeda(n.gastos), { html: delta(n.gastos, a.gastos, true, cmp.r) }, '', 'descer')}
        ${kpi('Sobrou', (resultado < 0 ? '− ' : '+ ') + moeda(Math.abs(resultado)), resultado >= 0 ? 'Fechou no azul' : 'Gastou mais do que entrou', '', 'feito')}
        ${kpi('Patrimônio pessoal', moedaCurta(pat.pessoal), 'Conta, caixinhas e ETFs, menos a fatura', '', 'carteira')}
      </div>
      <div class="grade painel bloco-espaco">
        <section class="cartao"><h2>Para onde foi o dinheiro <small>${moedaCurta(n.gastos)} em ${esc(nomeMes(m))}</small></h2>
          ${n.gastosItens.length ? rosca(porCategoria(n.gastosItens, n.reembolsos), moedaCurta(n.gastos), 'gastos', moedaCurta) : '<p class="vazio">Sem gastos neste mês.</p>'}</section>
        <section class="cartao"><h2>Reserva de emergência</h2>
          ${medidor(mesesReserva / 6, mesesReserva.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' meses', `${moedaCurta(reserva)} guardados. Meta: 6 meses de gastos (${moedaCurta(mediaGastos * 6)})`, 'var(--g2)')}</section>
      </div>
      <div class="grade painel bloco-espaco">
        <section class="cartao"><h2>Sobrou por mês <small>últimos 6 meses</small></h2>
          ${area(ultimosMeses(m).map(x => { const k = numeros(x); return { rotulo: rotuloMes(x), valor: k.retirada + k.pessoalPJ + k.outras - k.gastos }; }))}</section>
        <section class="cartao"><h2>Onde está seu dinheiro <small>${moedaCurta(pat.pessoal)}</small></h2>
          ${contasP.map(c => metrica(c.nome, moeda(c.saldo), Math.abs(c.saldo) / maxConta, c.saldo < 0 ? 'saida' : '')).join('') || '<p class="vazio">Nenhuma conta.</p>'}</section>
      </div>
      <div class="grade duas">
        <section class="cartao"><h2>Últimas transações <small><button class="btn pequeno" data-acao="ir" data-valor="lancamentos" data-filtro="pessoal">Ver todas</button></small></h2>
          ${lista(ultimos, linhaTransacao, 'Nenhuma transação.')}</section>
        <section class="cartao"><h2>Tarefas pessoais <small>${tarefas.length}</small></h2>${lista(tarefas.slice(0, 8), t => linhaTarefa(t), 'Nenhuma tarefa pessoal.')}</section>
      </div>
      <div class="grade duas bloco-espaco">${cartaoCompromissos('pessoal', m)}${cartaoImovel(m)}</div>`;
  },

  /* ---------- Lançamentos: todos os dados ---------- */
  lancamentos() {
    const m = mesAtual(), f = ui.filtroLanc;
    const doMes = dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === m)
      .filter(l => f === 'todos' || (f === 'classificar' ? A_CLASSIFICAR.includes(l.categoria) : l.escopo === f))
      .sort((a, b) => b.vencimento.localeCompare(a.vencimento));
    const pend = dados.lancamentos.filter(l => A_CLASSIFICAR.includes(l.categoria)).length;
    const pil = (v, r) => `<button class="pilula" data-acao="filtro-lanc" data-valor="${v}" aria-pressed="${f === v}">${esc(r)}</button>`;
    const grupos = [['conta', 'Contas'], ['investimento', 'Caixinhas e investimentos'], ['cartao', 'Faturas dos cartões']];
    const entradas = somaV(doMes.filter(l => l.tipo === 'entrada')), saidas = somaV(doMes.filter(l => l.tipo === 'saida'));
    return topo('Lançamentos', 'Tudo o que entrou e saiu, vindo do Nubank todo dia', seletorMes() +
      botaoNovo('lancamentos', 'Novo lançamento', JSON.stringify({ escopo: 'pessoal', vencimento: hoje(), tipo: 'saida' }))) + `
      <div class="pilulas">${pil('todos', 'Tudo')}${pil('empresa', 'Empresa')}${pil('pessoal', 'Pessoal')}${pil('classificar', `A classificar (${pend})`)}</div>
      <div class="grade duas">
        <section class="cartao"><h2>${esc(nomeMes(m))} <small>+${moedaCurta(entradas)} · −${moedaCurta(saidas)}</small></h2>
          ${lista(doMes, linhaLancamento, 'Nenhum lançamento aqui.')}</section>
        <section class="cartao"><h2>Contas <small><button class="btn pequeno" data-acao="novo" data-tabela="contas" data-padrao='${esc(JSON.stringify({ escopo: 'pessoal' }))}'>Nova conta</button></small></h2>
          ${grupos.map(([tipo, rotulo]) => {
            const cs = dados.contas.filter(c => c.ativa && tipoConta(c) === tipo);
            return cs.length ? `<h3 class="subtitulo">${rotulo}</h3>${lista(cs, c => `<li class="linha clicavel" data-acao="editar" data-tabela="contas" data-id="${c.id}"><div class="corpo"><b>${esc(c.nome)}</b><small>${ESCOPOS[c.escopo]}</small></div><span class="valor ${c.saldo < 0 ? 'negativo' : ''}">${moeda(c.saldo)}</span></li>`)}` : '';
          }).join('')}
          <p class="vazio" style="font-size:12.5px">Contas e faturas do Nubank se atualizam sozinhas todo dia. Caixinhas e ETFs são do retrato de 05/11: atualize clicando nelas.</p>
        </section>
      </div>`;
  },

  semana() {
    const base = somarDias(inicioSemana(hoje()), ui.deslocamentoSemana * 7);
    const dias = Array.from({ length: 7 }, (_, i) => somarDias(base, i));
    const metas = dados.metas_semana.filter(m => m.semana === base);
    const revisao = dados.revisoes_semana.find(r => r.semana === base);
    const marcados = revisao?.itens || [];
    const feitasSemana = dados.tarefas.filter(t => t.concluida_em && diaDe(t.concluida_em) >= base && diaDe(t.concluida_em) <= dias[6]).length;
    return topo('Semana', `${fmtData(dias[0])} a ${fmtData(dias[6])} · ${feitasSemana} tarefa(s) concluída(s)`, `
        <button class="btn" data-acao="semana" data-valor="-1">Anterior</button>
        <button class="btn" data-acao="semana" data-valor="0">Atual</button>
        <button class="btn" data-acao="semana" data-valor="1">Próxima</button>`) + `
      <div class="grade duas">
        <section class="cartao"><h2>Metas da semana <small>${metas.length} de 3</small></h2>
          ${lista(metas, m => `<li class="linha ${m.concluida ? 'feita' : ''}"><input type="checkbox" data-acao="meta" data-id="${m.id}" ${m.concluida ? 'checked' : ''} aria-label="Concluir meta: ${esc(m.titulo)}"><div class="corpo"><b>${esc(m.titulo)}</b></div><button class="btn pequeno" data-acao="apagar-meta" data-id="${m.id}">Tirar</button></li>`, 'Nenhuma meta definida.')}
          ${metas.length < 3 ? `<form class="captura" data-form="meta" data-semana="${base}" style="margin:10px 0 0"><input name="titulo" placeholder="Nova meta" aria-label="Nova meta"><button class="btn">Adicionar</button></form>` : ''}
        </section>
        <section class="cartao"><h2>Revisão de domingo, às 19h <small>${marcados.length} de ${ROTEIRO.length}</small></h2>
          <ul class="lista">${ROTEIRO.map(([k, r]) => `<li class="linha ${marcados.includes(k) ? 'feita' : ''}"><input type="checkbox" data-acao="roteiro" data-semana="${base}" data-chave="${k}" ${marcados.includes(k) ? 'checked' : ''} aria-label="${esc(r)}"><div class="corpo"><b>${esc(r)}</b></div></li>`).join('')}</ul>
        </section>
      </div>
      <h2 class="titulo-secao">Dia a dia <small>Agenda atualizada pelo chat</small></h2>
      <div class="dias">${dias.map(dia => {
        const tarefas = dados.tarefas.filter(t => t.status !== 'feita' && (t.vencimento === dia || t.prioridade_em === dia));
        return `<div class="dia ${dia === hoje() ? 'atual' : ''}"><h3>${esc(fmtData(dia, { weekday: 'short', day: '2-digit' }))}</h3>
          ${eventosDoDia(dia).map(e => `<div class="bloco"><b>${e.dia_inteiro ? 'Dia todo' : horaDe(e.inicio)}</b>${esc(e.titulo)}</div>`).join('')}
          ${tarefas.map(t => `<div class="bloco tarefa"><b>${t.prioridade_em === dia ? 'Prioridade' : 'Prazo'}</b>${esc(t.titulo)}</div>`).join('')}
        </div>`;
      }).join('')}</div>`;
  },

  tarefas() {
    const abertas = dados.tarefas.filter(t => t.status !== 'feita').sort((a, b) => (a.vencimento || '9999').localeCompare(b.vencimento || '9999'));
    const filtro = ui.frente;
    const caixa = abertas.filter(t => t.status === 'caixa');
    const grupos = Object.entries(FRENTES).filter(([v]) => filtro === 'todas' || filtro === v)
      .map(([v, nome]) => [nome, abertas.filter(t => t.frente === v && t.status !== 'caixa')]).filter(([, i]) => i.length);
    const feitas = dados.tarefas.filter(t => t.status === 'feita').sort((a, b) => (b.concluida_em || '').localeCompare(a.concluida_em || '')).slice(0, 10);
    const pilula = (v, r, n) => `<button class="pilula" data-acao="frente" data-valor="${v}" aria-pressed="${filtro === v}">${esc(r)} (${n})</button>`;
    return topo('Tarefas', `${abertas.length} em aberto`, botaoNovo('tarefas', 'Nova tarefa')) + `
      <div class="pilulas">${pilula('todas', 'Todas', abertas.length)}${Object.entries(FRENTES).map(([v, r]) => pilula(v, r, abertas.filter(t => t.frente === v && t.status !== 'caixa').length)).join('')}</div>
      <div class="grade">
        ${filtro === 'todas' ? `<section class="cartao"><h2>Caixa de entrada <small>${caixa.length}</small></h2>${lista(caixa, t => linhaTarefa(t), 'Caixa de entrada vazia.')}</section>` : ''}
        ${grupos.map(([nome, itens]) => `<section class="cartao"><h2>${esc(nome)} <small>${itens.length}</small></h2>${lista(itens, t => linhaTarefa(t))}</section>`).join('') || (filtro !== 'todas' ? '<p class="vazio">Nenhuma tarefa nesta frente.</p>' : '')}
        ${feitas.length ? `<section class="cartao"><h2>Concluídas recentemente</h2>${lista(feitas, t => linhaTarefa(t))}</section>` : ''}
      </div>`;
  },

  clientes() {
    const m = hoje().slice(0, 7);
    const abertos = dados.clientes.filter(clienteAberto);
    const contratos = contratosAtivos(abertos);
    const receita = contratos.reduce((s, k) => s + k.valor, 0);
    const recebido = contratos.reduce((s, k) => s + k.recebidoMes, 0);
    const pagos = contratos.filter(k => k.situacao.chave === 'pago').length;
    const terminando = contratos.filter(k => k.fim && diasEntre(hoje(), k.fim) <= 60).sort((a, b) => a.fim.localeCompare(b.fim));
    const maior = contratos[0];
    // Recebido por mês, separado por cliente (PJ + Pix pessoal)
    const meses = ultimosMeses(m, 6);
    const somaPor = {};
    const porMes = meses.map(mm => {
      const partes = {};
      dados.lancamentos.filter(l => l.vencimento.slice(0, 7) === mm && ehReceitaCliente(l)).forEach(l => {
        const c = clienteDoLancamento(l); const k = c ? nomeCurto(c) : /Uniao Este/i.test(l.descricao) ? 'Associação União Este' : 'Outros';
        partes[k] = (partes[k] || 0) + Number(l.valor); somaPor[k] = (somaPor[k] || 0) + Number(l.valor);
      });
      return { rotulo: rotuloMes(mm), destaque: mm === m, partes };
    });
    const series = Object.keys(somaPor).sort((a, b) => (a === 'Outros') - (b === 'Outros') || /Associação/.test(a) - /Associação/.test(b) || somaPor[b] - somaPor[a]).map(k => ({ chave: k, rotulo: k }));
    const total6 = Object.values(somaPor).reduce((s, v) => s + v, 0);
    const pessoal6 = somaV(dados.lancamentos.filter(l => meses.includes(l.vencimento.slice(0, 7)) && ehClienteNoPessoal(l)));
    const outros = dados.clientes.filter(c => !clienteAberto(c) && (ui.statusCliente === 'abertos' || ui.statusCliente === 'todos' || c.status === ui.statusCliente)).sort((a, b) => a.nome.localeCompare(b.nome));
    const pil = (v, r) => `<button class="pilula" data-acao="status-cliente" data-valor="${v}" aria-pressed="${ui.statusCliente === v || (v === 'todos' && ui.statusCliente === 'abertos')}">${esc(r)}</button>`;
    return topo('Clientes', `${contratos.length} contratos ativos · ${abertos.length} unidades atendidas`, botaoNovo('clientes', 'Novo cliente')) + `
      <div class="grade kpis">
        ${kpi('Receita contratada', moeda(receita), `${contratos.length} contratos por mês`, 'destaque', 'carteira')}
        ${kpi('Recebido em ' + rotuloMes(m), moeda(recebido), `${pagos} de ${contratos.length} contratos já pagaram`, '', 'feito')}
        ${kpi('Contratos terminando', String(terminando.length), terminando[0] ? `${terminando[0].nome} em ${fmtData(terminando[0].fim)}` : 'Nada nos próximos 60 dias', '', 'alerta')}
        ${kpi('Maior cliente', maior ? Math.round(maior.valor / (receita || 1) * 100) + '%' : '—', maior ? maior.nome + ' da receita' : '', '', 'subir')}
      </div>
      <section class="cartao bloco-espaco"><h2>Recebido de clientes <small>${moedaCurta(total6)} em 6 meses · ${moedaCurta(pessoal6)} caiu no Pix pessoal</small></h2>
        ${barrasEmpilhadas(porMes, series)}
        <p class="nota">Soma o que entrou na conta PJ e o que clientes pagaram no seu Pix pessoal (Nelson e a oficina). "Associação União Este" junta pagamentos antigos da associação (Elison, Giuseppe e outros) que não dá para separar pelo nome.</p>
      </section>
      <section class="cartao bloco-espaco"><h2>Clientes ativos <small>situação de ${rotuloMes(m)}</small></h2>
        <div class="tabela-rolagem"><table class="tabela-clientes">
          <thead><tr><th>Cliente</th><th>Recebe em</th><th class="num">Por mês</th><th class="num">Recebido em ${rotuloMes(m)}</th><th>Situação</th><th>Contrato até</th></tr></thead>
          <tbody>${contratos.map(k => `<tr class="clicavel" data-acao="abrir-cliente" data-id="${k.id}" role="button" tabindex="0">
            <td><div class="cel-cliente">${avatar(k.nome, k.nome)}<div><b>${esc(k.nome)}</b>${k.unidades.length > 1 ? `<small>${k.unidades.length} unidades</small>` : ''}</div></div></td>
            <td><span class="selo ${k.conta === 'Pix pessoal' ? 'ambar' : ''}">${esc(k.conta)}</span></td>
            <td class="num">${moeda(k.valor)}</td>
            <td class="num">${k.recebidoMes ? moeda(k.recebidoMes) : '—'}</td>
            <td><span class="selo ${k.situacao.cor}">${esc(k.situacao.texto.replace(/ · .*/, ''))}</span></td>
            <td>${k.fim ? `<span class="${diasEntre(hoje(), k.fim) <= 30 ? 'alerta' : ''}">${fmtData(k.fim, { day: '2-digit', month: '2-digit', year: '2-digit' })}</span>` : '<span class="fraco">sem data</span>'}</td></tr>`).join('')}</tbody>
        </table></div>
      </section>
      <div class="grade duas">
        <section class="cartao"><h2>De onde vem a receita <small>${moedaCurta(receita)}/mês</small></h2>
          ${contratos.map((k, i) => `<div class="fatia-receita"><div class="rotulo"><span><i style="background:${CORES[i % CORES.length]}"></i>${esc(k.nome)}</span><b>${moedaCurta(k.valor)} · ${Math.round(k.valor / (receita || 1) * 100)}%</b></div>
            <div class="progresso"><div style="width:${k.valor / (receita || 1) * 100}%;background:${CORES[i % CORES.length]}"></div></div></div>`).join('')}
        </section>
        <section class="cartao"><h2>Outros clientes <small>pausados e encerrados</small></h2>
          <div class="pilulas">${pil('todos', 'Todos')}${pil('pausado', 'Pausados')}${pil('encerrado', 'Encerrados')}</div>
          ${lista(outros, c => `<li class="linha clicavel" data-acao="abrir-cliente" data-id="${c.id}" role="button" tabindex="0">${avatar(c.nome, c.nome)}<div class="corpo"><b>${esc(nomeCurto(c))}</b>
            <small>${esc(STATUS_CLIENTE[c.status])}</small></div><span class="valor">${moeda(c.valor_mensal)}</span></li>`, 'Nenhum cliente aqui.')}
        </section>
      </div>`;
  },

  cliente() {
    const c = dados.clientes.find(x => x.id === ui.clienteId);
    if (!c) { ui.tela = 'clientes'; return TELA.clientes(); }
    let re = null; try { re = c.pagador ? new RegExp(c.pagador, 'i') : null; } catch (e) {}
    const pagos = re ? dados.lancamentos.filter(l => l.tipo === 'entrada' && re.test(l.descricao || '')).sort((a, b) => b.vencimento.localeCompare(a.vencimento)) : [];
    const totalAno = somaV(pagos.filter(l => l.vencimento.slice(0, 4) === hoje().slice(0, 4)));
    const docs = dados.documentos.filter(d => d.cliente_id === c.id).sort((a, b) => (b.data || b.criado_em).localeCompare(a.data || a.criado_em));
    const tarefas = dados.tarefas.filter(t => t.cliente_id === c.id && t.status !== 'feita');
    const cor = c.status === 'em_risco' ? 'vermelho' : c.status === 'ativo' ? 'azul' : '';
    const info = [['Contato', c.contato], ['Telefone', c.telefone], ['Serviços', c.servicos], ['Vencimento', c.dia_vencimento ? 'Todo dia ' + c.dia_vencimento : ''],
      ['Contrato', c.contrato_inicio || c.contrato_fim ? `${c.contrato_inicio ? fmtData(c.contrato_inicio, { day: '2-digit', month: '2-digit', year: 'numeric' }) : '?'} a ${c.contrato_fim ? fmtData(c.contrato_fim, { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'sem data'}` : ''], ['Grupo', c.grupo],
      ['Próxima ação', c.proxima_acao ? c.proxima_acao + (c.proxima_acao_em ? ' em ' + fmtData(c.proxima_acao_em) : '') : '']].filter(x => x[1]);
    return topo(c.nome, STATUS_CLIENTE[c.status] + ' · ' + moeda(c.valor_mensal) + ' por mês',
      `<button class="btn" data-acao="ir" data-valor="clientes">Voltar</button><button class="btn azul" data-acao="editar" data-tabela="clientes" data-id="${c.id}">Editar</button>`) + `
      <div class="grade kpis">
        ${kpi('Valor mensal', moeda(c.valor_mensal), STATUS_CLIENTE[c.status], 'destaque', 'carteira')}
        ${kpi('Recebido em ' + hoje().slice(0, 4), moeda(totalAno), pagos.length ? `${pagos.length} pagamento(s) encontrados` : 'Nenhum pagamento ligado', '', 'subir')}
        ${kpi('Último pagamento', pagos[0] ? moeda(pagos[0].valor) : '—', pagos[0] ? fmtData(pagos[0].vencimento) : 'Sem registro', '', 'feito')}
        ${kpi('Documentos', String(docs.length), `${docs.filter(d => d.tipo === 'contrato').length} contrato(s)`, '', 'lancamentos')}
      </div>
      <div class="grade duas bloco-espaco">
        <section class="cartao"><h2>Dados do cliente</h2>
          <dl class="ficha">${info.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
          ${c.notas ? `<p class="notas-cliente">${esc(c.notas)}</p>` : ''}
          <p><span class="selo ${cor}">${esc(STATUS_CLIENTE[c.status])}</span></p>
        </section>
        <section class="cartao"><h2>Entregas em aberto</h2>${lista(tarefas, t => linhaTarefa(t), 'Nada em aberto para este cliente.')}
          <p>${botaoNovo('tarefas', 'Nova entrega', JSON.stringify({ cliente_id: c.id, frente: 'agencia' }))}</p></section>
      </div>
      <div class="bloco-espaco">
        <section class="cartao"><h2>Documentos</h2>
          ${formDoc()}
          ${lista(docs, linhaDoc, 'Nenhum documento ainda. Anexe o contrato e os comprovantes.')}
        </section>
      </div>
      <div class="bloco-espaco">
        <section class="cartao"><h2>Pagamentos recebidos <small>${c.pagador ? 'pelo nome no Pix' : 'informe o nome do Pix em Editar'}</small></h2>
          ${lista(pagos.slice(0, 12), linhaTransacao, 'Nenhum pagamento encontrado no banco.')}</section>
      </div>`;
  },

  prospeccao() {
    const abertos = dados.leads.filter(leadAberto);
    const potencial = abertos.reduce((s, l) => s + Number(l.valor_estimado || 0), 0);
    const ganhos = dados.leads.filter(l => l.etapa === 'ganho').length;
    const encerrados = ganhos + dados.leads.filter(l => l.etapa === 'perdido').length;
    const vencidos = abertos.filter(l => l.proximo_followup && l.proximo_followup <= hoje()).length;
    const semProximo = abertos.filter(l => !l.proximo_followup).length;
    return topo('Prospecção', 'Todo lead em aberto precisa de um próximo passo', botaoNovo('leads', 'Novo lead')) + `
      <div class="grade kpis">
        ${kpi('Leads em aberto', String(abertos.length), `${semProximo} sem próximo passo`, 'destaque')}
        ${kpi('Valor mensal potencial', moeda(potencial), 'Soma dos leads em aberto')}
        ${kpi('Follow-ups', String(vencidos), 'Para hoje ou atrasados')}
        ${kpi('Taxa de fechamento', encerrados ? Math.round(ganhos / encerrados * 100) + '%' : '—', `${ganhos} ganho(s) de ${encerrados} encerrado(s)`)}
      </div>
      <div class="quadro">${Object.entries(ETAPAS).map(([v, nome]) => {
        const itens = dados.leads.filter(l => l.etapa === v);
        return `<div class="coluna"><h3>${esc(nome)} <span>${itens.length}</span></h3>${itens.map(l => `
          <button class="card-lead" data-acao="editar" data-tabela="leads" data-id="${l.id}">
            <b>${esc(l.nome)}</b>
            ${l.empresa ? `<small>${esc(l.empresa)}</small>` : ''}
            ${l.valor_estimado ? `<small>${moeda(l.valor_estimado)} por mês</small>` : ''}
            ${l.proximo_followup ? `<small class="${l.proximo_followup <= hoje() ? 'alerta' : ''}">Follow-up ${fmtData(l.proximo_followup)}</small>` : (leadAberto(l) ? '<small class="alerta">Sem próximo passo</small>' : '')}
          </button>`).join('')}</div>`;
      }).join('')}</div>`;
  }
};

/* ---------- Desenho ---------- */
function desenharNav() {
  const svg = k => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONES[k]}</svg>`;
  const item = ([k, nome]) => `<button class="nav-item" data-acao="ir" data-valor="${k}" ${ui.tela === k ? 'aria-current="page"' : ''}>${svg(k)}<span>${esc(nome)}</span></button>`;
  $('nav-lateral').innerHTML = MENU.map(([grupo, itens]) => `<div class="nav-grupo">${esc(grupo)}</div>` + itens.map(item).join('')).join('');
  $('nav-baixo').innerHTML = MENU_CELULAR.map(([k, nome]) => `<button data-acao="ir" data-valor="${k}" ${ui.tela === k ? 'aria-current="page"' : ''}>${svg(k)}<span>${esc(nome)}</span></button>`).join('');
}

function desenhar() {
  desenharNav();
  aplicarTema();
  $('tela').innerHTML = TELA[ui.tela]();
}

/* ---------- Ações ---------- */
Object.assign(manipuladores, {
  ir: b => { ui.tela = b.dataset.valor; if (b.dataset.filtro) ui.filtroLanc = b.dataset.filtro; desenhar(); window.scrollTo(0, 0); },
  'filtro-lanc': b => { ui.filtroLanc = b.dataset.valor; desenhar(); },
  sair: () => banco.auth.signOut(),
  tema: () => {
    const escuro = document.documentElement.dataset.theme !== 'dark';
    if (escuro) document.documentElement.dataset.theme = 'dark'; else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('tema', escuro ? 'escuro' : 'claro'); } catch (e) {}
    aplicarTema(); desenhar();
  },
  novo: b => abrirFormulario(b.dataset.tabela, null, b.dataset.padrao ? JSON.parse(b.dataset.padrao) : {}),
  editar: b => abrirFormulario(b.dataset.tabela, b.dataset.id),
  concluir: b => {
    const t = dados.tarefas.find(x => x.id === b.dataset.id);
    gravar('tarefas', { status: b.checked ? 'feita' : (t.frente ? 'a_fazer' : 'caixa') }, t.id);
  },
  estrela: b => {
    const t = dados.tarefas.find(x => x.id === b.dataset.id);
    gravar('tarefas', { prioridade_em: t.prioridade_em === b.dataset.dia ? null : b.dataset.dia }, t.id);
  },
  pagar: b => gravar('lancamentos', { pago: b.checked, pago_em: b.checked ? hoje() : null }, b.dataset.id),
  'dia-prioridade': b => { ui.diaPrioridade = b.dataset.valor; desenhar(); },
  frente: b => { ui.frente = b.dataset.valor; desenhar(); },
  escopo: b => { ui.escopo = b.dataset.valor; desenhar(); },
  visao: b => { ui.visao = b.dataset.valor; desenhar(); },
  periodo: b => { ui.periodo = b.dataset.valor; desenhar(); },
  'abrir-mes': b => { ui.mes = b.dataset.valor; ui.tela = ui.visao === 'tudo' ? 'geral' : ui.visao; desenhar(); window.scrollTo(0, 0); },
  'status-cliente': b => { ui.statusCliente = b.dataset.valor; desenhar(); },
  mes: b => { ui.mes = somarMes(ui.mes || hoje().slice(0, 7), Number(b.dataset.valor)); desenhar(); },
  semana: b => { ui.deslocamentoSemana = Number(b.dataset.valor) === 0 ? 0 : ui.deslocamentoSemana + Number(b.dataset.valor); desenhar(); },
  meta: b => gravar('metas_semana', { concluida: b.checked }, b.dataset.id),
  'apagar-meta': b => apagar('metas_semana', b.dataset.id),
  'abrir-cliente': b => { ui.clienteId = b.dataset.id; ui.tela = 'cliente'; desenhar(); window.scrollTo(0, 0); },
  'abrir-doc': async b => {
    const d = dados.documentos.find(x => x.id === b.dataset.id);
    const janela = window.open('', '_blank');
    const { data, error } = await banco.storage.from('documentos').createSignedUrl(d.caminho, 600);
    if (error) { janela?.close(); avisar('Não consegui abrir: ' + error.message, true); return; }
    if (janela) janela.location = data.signedUrl; else location.href = data.signedUrl;
  },
  'apagar-doc': async b => {
    if (!b.dataset.confirmar) { b.dataset.confirmar = '1'; b.textContent = 'Confirmar'; return; }
    const d = dados.documentos.find(x => x.id === b.dataset.id);
    const { error } = await banco.storage.from('documentos').remove([d.caminho]);
    if (error) { avisar('Não consegui apagar o arquivo: ' + error.message, true); return; }
    if (await apagar('documentos', d.id)) avisar('Documento apagado.');
  },
  'contato-hoje': b => gravar('clientes', { ultimo_contato: hoje() }, b.dataset.id).then(ok => ok && avisar('Contato registrado.')),
  roteiro: async b => {
    const semana = b.dataset.semana;
    const atual = dados.revisoes_semana.find(r => r.semana === semana)?.itens || [];
    const itens = b.checked ? [...new Set([...atual, b.dataset.chave])] : atual.filter(k => k !== b.dataset.chave);
    const { error } = await banco.from('revisoes_semana').upsert({ semana, itens });
    if (error) avisar(traduzirErro(error), true);
    await carregar();
  }
});

document.addEventListener('click', e => {
  const alvo = e.target.closest('[data-acao]');
  if (alvo && alvo.type !== 'checkbox') manipuladores[alvo.dataset.acao]?.(alvo);
});
document.addEventListener('change', e => {
  if (e.target.matches('input[type=checkbox][data-acao]')) manipuladores[e.target.dataset.acao]?.(e.target);
});
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('[role=button][data-acao]')) { e.preventDefault(); manipuladores[e.target.dataset.acao]?.(e.target); }
});
document.addEventListener('submit', async e => {
  const tipo = e.target.dataset.form;
  if (!tipo) return;
  e.preventDefault();
  if (tipo === 'documento') { await enviarDocumento(e.target); return; }
  const titulo = e.target.titulo.value.trim();
  if (!titulo) return;
  const ok = tipo === 'captura' ? await gravar('tarefas', { titulo })
    : await gravar('metas_semana', { titulo, semana: e.target.dataset.semana });
  if (ok && tipo === 'captura') avisar('Anotado na Caixa de entrada.');
});

async function enviarDocumento(form) {
  const arquivo = form.arquivo.files[0];
  if (!arquivo) return;
  if (arquivo.size > 20 * 1024 * 1024) { avisar('Arquivo maior que 20 MB.', true); return; }
  const botao = form.querySelector('button'); botao.disabled = true; botao.textContent = 'Enviando...';
  ui.tipoDoc = form.tipo.value;
  const limpo = arquivo.name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w.\-]+/g, '_');
  const imovel = form.dataset.imovel || null;
  const caminho = `${imovel ? 'imoveis/' + imovel : ui.clienteId}/${Date.now()}-${limpo}`;
  const { error } = await banco.storage.from('documentos').upload(caminho, arquivo, { contentType: arquivo.type || 'application/octet-stream' });
  if (error) { avisar('Não consegui enviar: ' + error.message, true); botao.disabled = false; botao.textContent = 'Anexar'; return; }
  if (await gravar('documentos', { cliente_id: imovel ? null : ui.clienteId, imovel_id: imovel, tipo: form.tipo.value, nome: arquivo.name.replace(/\.[^.]+$/, ''), caminho, data: hoje() })) avisar('Documento anexado.');
}

$('form-login').onsubmit = async e => {
  e.preventDefault();
  const { error } = await banco.auth.signInWithPassword({ email: $('email').value, password: $('senha').value });
  if (error) avisar('Email ou senha incorretos.', true);
};

function mostrar(logado) {
  $('login').hidden = logado;
  $('app').hidden = !logado;
  if (logado) carregar();
}
banco.auth.onAuthStateChange((_evento, sessao) => {
  // Fora do callback: chamar o banco aqui dentro pode travar a sessão
  setTimeout(() => mostrar(Boolean(sessao)), 0);
});
