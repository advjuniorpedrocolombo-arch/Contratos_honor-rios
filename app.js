const APP_CONFIG = {
  maxContractors: 5,
  backendUrl: '',
  contractTemplateId: '1Xn-UzT6-35DihvQAiN6qsKHLS6gdI8TFP40hCyoHtxM'
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

function showToast(message, type = '') {
  toast.textContent = message;
  toast.className = `toast show ${type}`.trim();
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.className = 'toast';
  }, 3200);
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
    const removeBtn = block.querySelector('.remove-contractor');
    removeBtn.style.display = number === 1 ? 'none' : '';
  });

  updateAddButtonState();
}

function updateAddButtonState() {
  addContractorBtn.disabled = contractorCount >= APP_CONFIG.maxContractors;
  addContractorBtn.textContent = contractorCount >= APP_CONFIG.maxContractors
    ? 'Limite atingido'
    : '+ Adicionar contratante';
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
  const rules = {
    nacionalidade: {
      'Brasileiro(a)': female ? 'brasileira' : 'brasileiro'
    }
  };

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
  const contractors = getContractors();
  const qualifications = contractors.map(buildQualification).filter(Boolean);

  qualificationPreview.textContent = qualifications.length
    ? qualifications.join('\n\n')
    : 'Preencha os dados do primeiro contratante para visualizar a qualificação.';
  qualificationPreview.style.whiteSpace = 'pre-line';
}

function updateHonorariumFields() {
  const value = modalidade.value;
  fixedFields.classList.toggle('hidden', !(value === 'fixos' || value === 'misto'));
  successFields.classList.toggle('hidden', !(value === 'exito' || value === 'misto'));
}

function getSelectedDocuments() {
  return [...form.querySelectorAll('input[name="documentos"]:checked')].map((el) => el.value);
}

function collectPayload() {
  const data = new FormData(form);
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
      observacoes: data.get('observacoesHonorarios') || '',
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
  if (!payload.servico.areaDireito || !payload.servico.tipoServico || !payload.servico.descricaoObjeto) {
    return 'Preencha os dados obrigatórios do serviço.';
  }
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

  if (!APP_CONFIG.backendUrl) {
    console.log('Payload pronto para integração:', payload);
    showToast('Interface pronta. Falta conectar o Apps Script para gerar os documentos.', 'error');
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.disabled = true;
  submitButton.textContent = 'Gerando...';

  try {
    const response = await fetch(APP_CONFIG.backendUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    if (!response.ok || result.ok === false) {
      throw new Error(result.message || 'Não foi possível gerar os documentos.');
    }

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

addContractorBtn.addEventListener('click', addContractor);
previewBtn.addEventListener('click', updateQualificationPreview);
modalidade.addEventListener('change', updateHonorariumFields);
form.addEventListener('input', (event) => {
  if (event.target.closest('.contractor-block')) updateQualificationPreview();
});
form.addEventListener('submit', submitForm);
resetBtn.addEventListener('click', () => {
  setTimeout(() => {
    contractorsContainer.innerHTML = '';
    contractorCount = 0;
    addContractor();
    configureInitialDate();
    updateHonorariumFields();
    updateQualificationPreview();
  }, 0);
});

addContractor();
configureInitialDate();
updateHonorariumFields();
updateBackendStatus();
