const APP_CONFIG = {
  maxContractors: 5,
  backendUrl: 'https://script.google.com/macros/s/AKfycbzQ_30iHNn567Y-nhYjKTXwPoTW7voJLAINDk6Pmjd9NcYSUgcSlGGxf-YvMA92DOKq/exec',
  contractTemplateId: '1Xn-UzT6-35DihvQAiN6qsKHLS6gdI8TFP40hCyoHtxM',
  defaultObjectText: 'Propositura e acompanhamento da medida judicial cabível, com atuação em todos os atos processuais necessários à defesa dos interesses do(a) CONTRATANTE, em todas as fases e instâncias compreendidas no objeto contratado, até o trânsito em julgado, ressalvados os serviços não abrangidos expressamente por este instrumento.'
};

const form = document.getElementById('contractForm');
const contractorsContainer = document.getElementById('contractorsContainer');
const contractorTemplate = document.getElementById('contractorTemplate');
const addContractorBtn = document.getElementById('addContractorBtn');
const previewBtn = document.getElementById('previewBtn');
const qualificationPreview = document.getElementById('qualificationPreview');
const modalidade = document.getElementById('modalidade');
const fixedFields = document.getElementById('fixedFields');
const successFields = document.getElementById('successFields');
const backendStatus = document.getElementById('backendStatus');
const toast = document.getElementById('toast');
const resetBtn = document.getElementById('resetBtn');

let contractorCount = 0;
let installmentSchedule = [];

function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = `toast show ${type}`.trim();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => { toast.className = 'toast'; }, 3200);
}

function onlyDigits(value, max = 99) {
  return String(value || '').replace(/\D/g, '').slice(0, max);
}

function formatCPF(value) {
  const v = onlyDigits(value, 11);
  return v
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function formatRG(value) {
  const v = onlyDigits(value, 9);
  return v
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1})$/, '$1-$2');
}

function formatPhone(value) {
  const v = onlyDigits(value, 11);
  if (v.length <= 10) {
    return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  }
  return v.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

function addContractor() {
  if (contractorCount >= APP_CONFIG.maxContractors) {
    showToast('Limite de 5 contratantes atingido.', 'error');
    return;
  }

  contractorCount += 1;
  const fragment = contractorTemplate.content.cloneNode(true);
  const block = fragment.querySelector('.contractor-block');
  block.dataset.index = contractorCount;

  fragment.querySelector('.contractor-badge').textContent = contractorCount;
  fragment.querySelector('.contractor-title').textContent = `Contratante ${contractorCount}`;

  fragment.querySelectorAll('[data-field]').forEach((field) => {
    field.name = `contratante_${contractorCount}_${field.dataset.field}`;
  });

  const removeBtn = fragment.querySelector('.remove-contractor');
  if (contractorCount === 1) {
    removeBtn.style.display = 'none';
  } else {
    removeBtn.addEventListener('click', () => {
      block.remove();
      normalizeContractors();
      updateQualificationPreview();
    });
  }

  contractorsContainer.appendChild(fragment);
  updateAddButtonState();
}

function normalizeContractors() {
  const blocks = [...contractorsContainer.querySelectorAll('.contractor-block')];
  contractorCount = blocks.length;

  blocks.forEach((block, idx) => {
    const number = idx + 1;
    block.dataset.index = number;
    block.querySelector('.contractor-badge').textContent = number;
    block.querySelector('.contractor-title').textContent = `Contratante ${number}`;
    block.querySelectorAll('[data-field]').forEach((field) => {
      field.name = `contratante_${number}_${field.dataset.field}`;
    });
    block.querySelector('.remove-contractor').style.display = number === 1 ? 'none' : '';
  });

  updateAddButtonState();
}

function updateAddButtonState() {
  addContractorBtn.disabled = contractorCount >= APP_CONFIG.maxContractors;
  addContractorBtn.textContent = contractorCount >= APP_CONFIG.maxContractors ? 'Limite atingido' : '+ Adicionar contratante';
}

function getContractors() {
  return [...contractorsContainer.querySelectorAll('.contractor-block')].map((block) => {
    const person = {};
    block.querySelectorAll('[data-field]').forEach((field) => {
      person[field.dataset.field] = field.value.trim();
    });
    return person;
  });
}

function buildAddress(p) {
  const line1 = [p.logradouro, p.numero].filter(Boolean).join(', ');
  const line2 = [p.complemento, p.bairro].filter(Boolean).join(', ');
  const line3 = [p.cidade, p.estado].filter(Boolean).join('/');
  return [line1, line2, line3, p.cep ? `CEP ${p.cep}` : ''].filter(Boolean).join(', ');
}

function normalizeGendered(value, gender, type) {
  if (!value) return '';
  const text = value.trim();
  if (!gender) return text;
  const female = gender === 'Feminino';
  const rules = { nacionalidade: { 'Brasileiro(a)': female ? 'brasileira' : 'brasileiro' } };
  if (rules[type] && rules[type][text]) return rules[type][text];
  return text.toLowerCase();
}

function buildQualification(p) {
  if (!p.nomeCompleto) return '';
  const nome = p.nomeCompleto.toLocaleUpperCase('pt-BR');
  const parts = [nome];
  const nacionalidade = normalizeGendered(p.nacionalidade, p.sexo, 'nacionalidade');
  if (nacionalidade) parts.push(nacionalidade);
  if (p.estadoCivil) parts.push(p.estadoCivil.toLowerCase());
  if (p.profissao) parts.push(p.profissao.toLowerCase());

  let text = parts.join(', ');
  if (p.rg) {
    text += `, portador(a) da cédula de identidade RG nº ${p.rg}`;
    if (p.orgaoRg) text += `, expedida por ${p.orgaoRg}`;
  }
  if (p.cpf) text += `, inscrito(a) no CPF sob nº ${p.cpf}`;
  const address = buildAddress(p);
  if (address) text += `, residente e domiciliado(a) em ${address}`;
  return `${text}.`;
}

function updateQualificationPreview() {
  const qualifications = getContractors().map(buildQualification).filter(Boolean);
  qualificationPreview.textContent = qualifications.length
    ? qualifications.join('\n\n')
    : 'Preencha os dados do primeiro contratante para visualizar a qualificação.';
  qualificationPreview.style.whiteSpace = 'pre-line';
}

function ensureDefaultObjectText() {
  const field = form.querySelector('[name="descricaoObjeto"]');
  if (field && !field.value.trim()) field.value = APP_CONFIG.defaultObjectText;
}

function ensureInstallmentScheduleUI() {
  if (document.getElementById('installmentScheduleBlock')) return;

  const style = document.createElement('style');
  style.textContent = `
    .schedule-block{margin-top:18px;padding:18px;border:1px solid #dbe3ec;border-radius:14px;background:#f8fafc}
    .schedule-head{display:flex;justify-content:space-between;gap:12px;align-items:center;margin-bottom:12px}
    .schedule-head h4{margin:0;color:#0c1b2e;font:700 17px 'Playfair Display',Georgia,serif}.schedule-head small{display:block;color:#667085;font-size:11px;margin-top:2px}
    .schedule-row{display:grid;grid-template-columns:110px 1fr 1fr;gap:12px;align-items:end;padding:11px 0;border-top:1px solid #e7edf3}
    .schedule-row:first-child{border-top:0}.schedule-label{font-size:12px;font-weight:700;color:#344054;padding-bottom:12px}
    .schedule-empty{font-size:12px;color:#667085;padding:6px 0}
    @media(max-width:640px){.schedule-row{grid-template-columns:1fr}.schedule-label{padding-bottom:0}}
  `;
  document.head.appendChild(style);

  const block = document.createElement('div');
  block.id = 'installmentScheduleBlock';
  block.className = 'schedule-block hidden';
  block.innerHTML = `
    <div class="schedule-head">
      <div><h4>Cronograma de pagamento</h4><small>Vencimentos e valores são preenchidos automaticamente e permanecem editáveis.</small></div>
      <button type="button" class="btn btn-secondary" id="recalculateScheduleBtn">Recalcular</button>
    </div>
    <div id="installmentScheduleRows"></div>
  `;
  fixedFields.insertAdjacentElement('afterend', block);
  block.querySelector('#recalculateScheduleBtn').addEventListener('click', () => renderInstallmentSchedule(true));
}

function parseDateLocal(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return null;
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toDateInput(date) {
  if (!(date instanceof Date) || isNaN(date)) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function addMonthsWithDay(base, months, preferredDay) {
  const target = new Date(base.getFullYear(), base.getMonth() + months, 1);
  const maxDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
  target.setDate(Math.min(Number(preferredDay) || base.getDate(), maxDay));
  return target;
}

function renderInstallmentSchedule(force = false) {
  ensureInstallmentScheduleUI();
  const block = document.getElementById('installmentScheduleBlock');
  const rows = document.getElementById('installmentScheduleRows');
  const isFixed = modalidade.value === 'fixos' || modalidade.value === 'misto';
  const qtd = Math.max(0, Number(form.querySelector('[name="parcelas"]')?.value || 0));
  const entrada = form.querySelector('[name="entrada"]')?.value.trim() || '';

  if (!isFixed || (!qtd && !entrada)) {
    block.classList.add('hidden');
    rows.innerHTML = '';
    installmentSchedule = [];
    return;
  }

  block.classList.remove('hidden');
  if (!force && rows.querySelector('.schedule-row')) return;

  const parcelaPadrao = form.querySelector('[name="valorParcela"]')?.value.trim() || '';
  const primeiroVencimento = form.querySelector('[name="primeiroVencimento"]')?.value || '';
  const diaSeguinte = form.querySelector('[name="diaVencimento"]')?.value || '';
  const dataDocumento = form.querySelector('[name="dataDocumento"]')?.value || '';
  const baseDate = parseDateLocal(primeiroVencimento);

  const items = [];
  if (entrada) {
    items.push({ tipo: 'Entrada', data: dataDocumento || primeiroVencimento || '', valor: entrada });
  }
  for (let i = 0; i < qtd; i += 1) {
    let data = '';
    if (baseDate) data = toDateInput(i === 0 ? baseDate : addMonthsWithDay(baseDate, i, diaSeguinte));
    items.push({ tipo: `Parcela ${i + 1}`, data, valor: parcelaPadrao });
  }

  installmentSchedule = items;
  rows.innerHTML = items.length ? items.map((item, idx) => `
    <div class="schedule-row" data-schedule-index="${idx}">
      <div class="schedule-label">${item.tipo}</div>
      <label>Vencimento<input type="date" class="schedule-date" value="${item.data}"></label>
      <label>Valor<input type="text" class="schedule-value" value="${item.valor}" placeholder="R$ 0,00"></label>
    </div>
  `).join('') : '<div class="schedule-empty">Informe entrada ou quantidade de parcelas.</div>';
}

function getInstallmentSchedule() {
  const rows = [...document.querySelectorAll('#installmentScheduleRows .schedule-row')];
  return rows.map((row) => ({
    tipo: row.querySelector('.schedule-label')?.textContent.trim() || '',
    vencimento: row.querySelector('.schedule-date')?.value || '',
    valor: row.querySelector('.schedule-value')?.value.trim() || ''
  }));
}

function formatDateBR(dateString) {
  if (!dateString) return '';
  const parts = dateString.split('-');
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : dateString;
}

function buildScheduleText(schedule) {
  if (!schedule.length) return '';
  return 'Cronograma de pagamento: ' + schedule.map((item) => {
    const date = formatDateBR(item.vencimento);
    return `${item.tipo}: ${item.valor || 'valor a definir'}${date ? `, vencimento em ${date}` : ''}`;
  }).join('; ') + '.';
}

function updateHonorariumFields() {
  const value = modalidade.value;
  fixedFields.classList.toggle('hidden', !(value === 'fixos' || value === 'misto'));
  successFields.classList.toggle('hidden', !(value === 'exito' || value === 'misto'));
  renderInstallmentSchedule(true);
}

function getSelectedDocuments() {
  return [...form.querySelectorAll('input[name="documentos"]:checked')].map((el) => el.value);
}

function collectPayload() {
  const data = new FormData(form);
  const schedule = getInstallmentSchedule();
  const userObs = data.get('observacoesHonorarios') || '';
  const scheduleText = buildScheduleText(schedule);
  const combinedObs = [userObs, scheduleText].filter(Boolean).join(' ');

  return {
    contratantes: getContractors(),
    servico: {
      areaDireito: data.get('areaDireito') || '',
      tipoServico: data.get('tipoServico') || '',
      descricaoObjeto: data.get('descricaoObjeto') || '',
      parteContraria: data.get('parteContraria') || '',
      numeroProcesso: data.get('numeroProcesso') || '',
      varaForo: data.get('varaForo') || '',
      observacoes: data.get('observacoes') || ''
    },
    honorarios: {
      modalidade: data.get('modalidade') || '',
      formaPagamento: data.get('formaPagamento') || '',
      primeiroVencimento: data.get('primeiroVencimento') || '',
      valorTotal: data.get('valorTotal') || '',
      entrada: data.get('entrada') || '',
      parcelas: data.get('parcelas') || '',
      valorParcela: data.get('valorParcela') || '',
      diaVencimento: data.get('diaVencimento') || '',
      observacoes: combinedObs,
      observacoesOriginais: userObs,
      parcelamento: schedule,
      percentualExito: data.get('percentualExito') || '',
      baseCalculoExito: data.get('baseCalculoExito') || '',
      momentoExito: data.get('momentoExito') || ''
    },
    documentos: getSelectedDocuments(),
    assinatura: {
      cidade: data.get('cidadeAssinatura') || '',
      data: data.get('dataDocumento') || ''
    },
    modeloContratoId: APP_CONFIG.contractTemplateId
  };
}

function validatePayload(payload) {
  if (!payload.contratantes.length) return 'Informe pelo menos um contratante.';
  if (!payload.documentos.length) return 'Selecione pelo menos um documento para gerar.';
  if (!payload.servico.areaDireito || !payload.servico.tipoServico || !payload.servico.descricaoObjeto) return 'Preencha os dados obrigatórios do serviço.';
  if (!payload.honorarios.modalidade) return 'Selecione a modalidade dos honorários.';
  if (!payload.assinatura.cidade || !payload.assinatura.data) return 'Informe cidade e data do documento.';
  return '';
}

async function submitForm(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;

  const payload = collectPayload();
  const validationError = validatePayload(payload);
  if (validationError) {
    showToast(validationError, 'error');
    return;
  }

  updateQualificationPreview();
  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Gerando...';

  try {
    const response = await fetch(APP_CONFIG.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok || result.ok === false) throw new Error(result.message || 'Não foi possível gerar os documentos.');
    showToast('Documentos gerados com sucesso.', 'success');
  } catch (error) {
    console.error(error);
    showToast(error.message || 'Erro ao comunicar com o servidor.', 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = originalText;
  }
}

function configureInitialDate() {
  const input = form.querySelector('input[name="dataDocumento"]');
  if (!input.value) {
    const now = new Date();
    const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    input.value = local.toISOString().slice(0, 10);
  }
}

function updateBackendStatus() {
  if (APP_CONFIG.backendUrl) {
    backendStatus.textContent = 'Backend conectado';
    backendStatus.style.background = '#ecfdf3';
    backendStatus.style.color = '#027a48';
  } else {
    backendStatus.textContent = 'Backend não configurado';
  }
}

function handleMasks(event) {
  const field = event.target;
  if (!field.matches('[data-field]')) return;
  if (field.dataset.field === 'cpf') field.value = formatCPF(field.value);
  if (field.dataset.field === 'rg') field.value = formatRG(field.value);
  if (field.dataset.field === 'telefone') field.value = formatPhone(field.value);
}

function handleScheduleSourceChange(event) {
  const names = ['entrada', 'parcelas', 'valorParcela', 'primeiroVencimento', 'diaVencimento', 'dataDocumento'];
  if (names.includes(event.target.name)) renderInstallmentSchedule(true);
}

addContractorBtn.addEventListener('click', addContractor);
previewBtn.addEventListener('click', updateQualificationPreview);
modalidade.addEventListener('change', updateHonorariumFields);
form.addEventListener('input', (event) => {
  handleMasks(event);
  handleScheduleSourceChange(event);
  if (event.target.closest('.contractor-block')) updateQualificationPreview();
});
form.addEventListener('change', handleScheduleSourceChange);
form.addEventListener('submit', submitForm);
resetBtn.addEventListener('click', () => {
  setTimeout(() => {
    contractorsContainer.innerHTML = '';
    contractorCount = 0;
    installmentSchedule = [];
    addContractor();
    configureInitialDate();
    ensureDefaultObjectText();
    updateHonorariumFields();
    updateQualificationPreview();
  }, 0);
});

ensureInstallmentScheduleUI();
addContractor();
configureInitialDate();
ensureDefaultObjectText();
updateHonorariumFields();
updateBackendStatus();
