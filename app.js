const APP_CONFIG = {

  maxContractors: 5,

  backendUrl:
    'https://script.google.com/macros/s/AKfycbzQ_30iHNn567Y-nhYjKTXwPoTW7voJLAINDk6Pmjd9NcYSUgcSlGGxf-YvMA92DOKq/exec',

  contractTemplateId:
    '1Xn-UzT6-35DihvQAiN6qsKHLS6gdI8TFP40hCyoHtxM',

  defaultObjectText:
    'Propositura e acompanhamento da medida judicial cabível, com atuação em todos os atos processuais necessários à defesa dos interesses do(a) CONTRATANTE, até o trânsito em julgado, ressalvados os serviços não abrangidos expressamente por este instrumento.'
};


const form =
  document.getElementById('contractForm');

const contractorsContainer =
  document.getElementById('contractorsContainer');

const contractorTemplate =
  document.getElementById('contractorTemplate');

const addContractorBtn =
  document.getElementById('addContractorBtn');

const previewBtn =
  document.getElementById('previewBtn');

const qualificationPreview =
  document.getElementById('qualificationPreview');

const modalidade =
  document.getElementById('modalidade');

const fixedFields =
  document.getElementById('fixedFields');

const successFields =
  document.getElementById('successFields');

const backendStatus =
  document.getElementById('backendStatus');

const toast =
  document.getElementById('toast');

const resetBtn =
  document.getElementById('resetBtn');


let contractorCount = 0;


/************************************************************
 * MENSAGENS
 ************************************************************/

function showToast(
  message,
  type = ''
) {

  toast.textContent =
    message;

  toast.className =
    `toast show ${type}`.trim();

  clearTimeout(
    showToast.timer
  );

  showToast.timer =
    setTimeout(
      () => {

        toast.className =
          'toast';

      },
      3500
    );
}


/************************************************************
 * NÚMEROS
 ************************************************************/

function onlyDigits(
  value,
  max = 99
) {

  return String(
    value || ''
  )
    .replace(
      /\D/g,
      ''
    )
    .slice(
      0,
      max
    );
}


/************************************************************
 * CPF
 ************************************************************/

function formatCPF(value) {

  const v =
    onlyDigits(
      value,
      11
    );

  return v
    .replace(
      /(\d{3})(\d)/,
      '$1.$2'
    )
    .replace(
      /(\d{3})(\d)/,
      '$1.$2'
    )
    .replace(
      /(\d{3})(\d{1,2})$/,
      '$1-$2'
    );
}


/************************************************************
 * RG
 ************************************************************/

function formatRG(value) {

  const v =
    onlyDigits(
      value,
      9
    );

  return v
    .replace(
      /(\d{2})(\d)/,
      '$1.$2'
    )
    .replace(
      /(\d{3})(\d)/,
      '$1.$2'
    )
    .replace(
      /(\d{3})(\d{1})$/,
      '$1-$2'
    );
}


/************************************************************
 * TELEFONE
 ************************************************************/

function formatPhone(value) {

  const v =
    onlyDigits(
      value,
      11
    );

  if (
    v.length <= 10
  ) {

    return v
      .replace(
        /(\d{2})(\d)/,
        '($1) $2'
      )
      .replace(
        /(\d{4})(\d{1,4})$/,
        '$1-$2'
      );
  }

  return v
    .replace(
      /(\d{2})(\d)/,
      '($1) $2'
    )
    .replace(
      /(\d{5})(\d{1,4})$/,
      '$1-$2'
    );
}


/************************************************************
 * CEP
 ************************************************************/

function formatCEP(value) {

  const v =
    onlyDigits(
      value,
      8
    );

  return v.replace(
    /(\d{5})(\d{1,3})$/,
    '$1-$2'
  );
}


/************************************************************
 * MOEDA
 ************************************************************/

function formatCurrencyBRL(value) {

  const digits =
    String(
      value || ''
    )
      .replace(
        /\D/g,
        ''
      );


  if (
    !digits
  ) {

    return '';
  }


  const amount =
    Number(digits) /
    100;


  return amount
    .toLocaleString(
      'pt-BR',
      {

        style:
          'currency',

        currency:
          'BRL'
      }
    );
}


/************************************************************
 * CAIXA ALTA
 ************************************************************/

function upperName(value) {

  return String(
    value || ''
  )
    .toLocaleUpperCase(
      'pt-BR'
    );
}


/************************************************************
 * CONTRATANTE
 ************************************************************/

function addContractor() {

  if (
    contractorCount >=
    APP_CONFIG.maxContractors
  ) {

    showToast(
      'Limite de 5 contratantes atingido.',
      'error'
    );

    return;
  }


  contractorCount++;


  const fragment =
    contractorTemplate
      .content
      .cloneNode(true);


  const block =
    fragment
      .querySelector(
        '.contractor-block'
      );


  block.dataset.index =
    contractorCount;


  fragment
    .querySelector(
      '.contractor-badge'
    )
    .textContent =
      contractorCount;


  fragment
    .querySelector(
      '.contractor-title'
    )
    .textContent =
      `Contratante ${contractorCount}`;


  fragment
    .querySelectorAll(
      '[data-field]'
    )
    .forEach(
      field => {

        field.name =
          `contratante_${contractorCount}_${field.dataset.field}`;
      }
    );


  const removeBtn =
    fragment
      .querySelector(
        '.remove-contractor'
      );


  if (
    contractorCount === 1
  ) {

    removeBtn.style.display =
      'none';

  } else {

    removeBtn.addEventListener(
      'click',
      () => {

        block.remove();

        normalizeContractors();

        updateQualificationPreview();
      }
    );
  }


  contractorsContainer
    .appendChild(
      fragment
    );


  updateAddButtonState();
}


/************************************************************
 * REENUMERA
 ************************************************************/

function normalizeContractors() {

  const blocks =
    [
      ...contractorsContainer
        .querySelectorAll(
          '.contractor-block'
        )
    ];


  contractorCount =
    blocks.length;


  blocks.forEach(
    (block, index) => {

      const number =
        index + 1;


      block.dataset.index =
        number;


      block
        .querySelector(
          '.contractor-badge'
        )
        .textContent =
          number;


      block
        .querySelector(
          '.contractor-title'
        )
        .textContent =
          `Contratante ${number}`;


      block
        .querySelectorAll(
          '[data-field]'
        )
        .forEach(
          field => {

            field.name =
              `contratante_${number}_${field.dataset.field}`;
          }
        );


      const remove =
        block
          .querySelector(
            '.remove-contractor'
          );


      remove.style.display =
        number === 1
          ? 'none'
          : '';
    }
  );


  updateAddButtonState();
}


/************************************************************
 * BOTÃO ADICIONAR
 ************************************************************/

function updateAddButtonState() {

  addContractorBtn.disabled =
    contractorCount >=
    APP_CONFIG.maxContractors;


  addContractorBtn.textContent =
    contractorCount >=
    APP_CONFIG.maxContractors

      ? 'Limite atingido'

      : '+ Adicionar contratante';
}


/************************************************************
 * DADOS DOS CONTRATANTES
 ************************************************************/

function getContractors() {

  return [
    ...contractorsContainer
      .querySelectorAll(
        '.contractor-block'
      )
  ]
    .map(
      block => {

        const pessoa = {};


        block
          .querySelectorAll(
            '[data-field]'
          )
          .forEach(
            field => {

              let value =
                field.value.trim();


              if (
                field.dataset.field ===
                'nomeCompleto'
              ) {

                value =
                  upperName(
                    value
                  );
              }


              pessoa[
                field.dataset.field
              ] =
                value;
            }
          );


        return pessoa;
      }
    );
}


/************************************************************
 * ENDEREÇO
 ************************************************************/

function buildAddress(p) {

  const linha1 =
    [
      p.logradouro,
      p.numero
    ]
      .filter(Boolean)
      .join(', ');


  const linha2 =
    [
      p.complemento,
      p.bairro
    ]
      .filter(Boolean)
      .join(', ');


  const cidade =
    [
      p.cidade,
      p.estado
    ]
      .filter(Boolean)
      .join('/');


  return [
    linha1,
    linha2,
    cidade,

    p.cep
      ? `CEP ${p.cep}`
      : ''
  ]
    .filter(Boolean)
    .join(', ');
}


/************************************************************
 * GÊNERO
 ************************************************************/

function normalizeGendered(
  value,
  gender,
  type
) {

  if (
    !value
  ) {

    return '';
  }


  const text =
    value.trim();


  const female =
    gender ===
    'Feminino';


  if (
    type ===
      'nacionalidade' &&
    text ===
      'Brasileiro(a)'
  ) {

    return female
      ? 'brasileira'
      : 'brasileiro';
  }


  return text.toLowerCase();
}


/************************************************************
 * QUALIFICAÇÃO
 ************************************************************/

function buildQualification(p) {

  if (
    !p.nomeCompleto
  ) {

    return '';
  }


  const nome =
    upperName(
      p.nomeCompleto
    );


  const feminino =
    p.sexo ===
    'Feminino';


  const nacionalidade =
    normalizeGendered(
      p.nacionalidade,
      p.sexo,
      'nacionalidade'
    );


  const partes =
    [
      nome,
      nacionalidade,
      p.estadoCivil
        ?.toLowerCase(),
      p.profissao
        ?.toLowerCase()
    ]
      .filter(Boolean);


  let texto =
    partes.join(', ');


  if (
    p.rg
  ) {

    texto +=
      feminino

        ? `, portadora da cédula de identidade RG nº ${p.rg}`

        : `, portador da cédula de identidade RG nº ${p.rg}`;


    if (
      p.orgaoRg
    ) {

      texto +=
        `, expedida por ${p.orgaoRg}`;
    }
  }


  if (
    p.cpf
  ) {

    texto +=
      feminino

        ? `, inscrita no CPF sob nº ${p.cpf}`

        : `, inscrito no CPF sob nº ${p.cpf}`;
  }


  const endereco =
    buildAddress(p);


  if (
    endereco
  ) {

    texto +=
      feminino

        ? `, residente e domiciliada em ${endereco}`

        : `, residente e domiciliado em ${endereco}`;
  }


  return `${texto}.`;
}


/************************************************************
 * PRÉVIA
 ************************************************************/

function updateQualificationPreview() {

  const contratantes =
    getContractors();


  if (
    !contratantes.some(
      p =>
        p.nomeCompleto
    )
  ) {

    qualificationPreview
      .innerHTML =
        'Preencha os dados do primeiro contratante para visualizar a qualificação.';

    return;
  }


  const html =
    contratantes
      .filter(
        p =>
          p.nomeCompleto
      )
      .map(
        p => {

          const qualificacao =
            buildQualification(p);

          const nome =
            upperName(
              p.nomeCompleto
            );


          return qualificacao
            .replace(
              nome,
              `<strong>${nome}</strong>`
            );
        }
      )
      .join(
        '<br><br>'
      );


  qualificationPreview
    .innerHTML =
      html;
}


/************************************************************
 * OBJETO PADRÃO
 ************************************************************/

function ensureDefaultObjectText() {

  const campo =
    form.querySelector(
      '[name="descricaoObjeto"]'
    );


  if (
    campo &&
    !campo.value.trim()
  ) {

    campo.value =
      APP_CONFIG
        .defaultObjectText;
  }
}


/************************************************************
 * UI DO CRONOGRAMA
 ************************************************************/

function ensureInstallmentScheduleUI() {

  if (
    document.getElementById(
      'installmentScheduleBlock'
    )
  ) {

    return;
  }


  const bloco =
    document.createElement(
      'div'
    );


  bloco.id =
    'installmentScheduleBlock';


  bloco.className =
    'schedule-block hidden';


  bloco.innerHTML = `

    <div class="schedule-head">

      <div>

        <h4>
          Cronograma de pagamento
        </h4>

        <small>
          Os vencimentos e os valores podem ser alterados manualmente.
        </small>

      </div>

      <button
        type="button"
        class="btn btn-secondary"
        id="recalculateScheduleBtn"
      >
        Recalcular
      </button>

    </div>

    <div
      id="installmentScheduleRows"
    ></div>
  `;


  fixedFields.insertAdjacentElement(
    'afterend',
    bloco
  );


  const style =
    document.createElement(
      'style'
    );


  style.textContent = `

    .schedule-block{

      margin-top:18px;

      padding:18px;

      border:
        1px solid #dbe3ec;

      border-radius:14px;

      background:#f8fafc;
    }

    .schedule-head{

      display:flex;

      justify-content:
        space-between;

      align-items:center;

      gap:12px;

      margin-bottom:12px;
    }

    .schedule-head h4{

      margin:0;

      color:#0c1b2e;

      font:
        700 17px
        'Playfair Display',
        Georgia,
        serif;
    }

    .schedule-head small{

      display:block;

      color:#667085;

      font-size:11px;

      margin-top:2px;
    }

    .schedule-row{

      display:grid;

      grid-template-columns:
        120px 1fr 1fr;

      gap:12px;

      align-items:end;

      padding:
        11px 0;

      border-top:
        1px solid #e7edf3;
    }

    .schedule-label{

      font-weight:700;

      font-size:12px;

      padding-bottom:12px;
    }

    @media(max-width:640px){

      .schedule-row{
        grid-template-columns:1fr;
      }

      .schedule-label{
        padding-bottom:0;
      }
    }
  `;


  document.head
    .appendChild(
      style
    );


  document
    .getElementById(
      'recalculateScheduleBtn'
    )
    .addEventListener(
      'click',
      () => {

        renderInstallmentSchedule(
          true
        );
      }
    );
}


/************************************************************
 * DATAS
 ************************************************************/

function parseDateLocal(value) {

  if (
    !/^\d{4}-\d{2}-\d{2}$/
      .test(
        value || ''
      )
  ) {

    return null;
  }


  const partes =
    value
      .split('-')
      .map(Number);


  return new Date(
    partes[0],
    partes[1] - 1,
    partes[2]
  );
}


function toDateInput(date) {

  if (
    !date ||
    isNaN(
      date.getTime()
    )
  ) {

    return '';
  }


  const ano =
    date.getFullYear();


  const mes =
    String(
      date.getMonth() + 1
    )
      .padStart(
        2,
        '0'
      );


  const dia =
    String(
      date.getDate()
    )
      .padStart(
        2,
        '0'
      );


  return `${ano}-${mes}-${dia}`;
}


function addMonthsWithDay(
  base,
  months,
  preferredDay
) {

  const target =
    new Date(
      base.getFullYear(),
      base.getMonth() +
        months,
      1
    );


  const ultimoDia =
    new Date(
      target.getFullYear(),
      target.getMonth() +
        1,
      0
    )
      .getDate();


  target.setDate(
    Math.min(
      Number(
        preferredDay
      ) ||
      base.getDate(),

      ultimoDia
    )
  );


  return target;
}


/************************************************************
 * CRONOGRAMA
 ************************************************************/

function renderInstallmentSchedule(
  force = false
) {

  ensureInstallmentScheduleUI();


  const bloco =
    document.getElementById(
      'installmentScheduleBlock'
    );


  const rows =
    document.getElementById(
      'installmentScheduleRows'
    );


  const parcelas =
    Number(
      form
        .querySelector(
          '[name="parcelas"]'
        )
        ?.value ||
      0
    );


  const entrada =
    form
      .querySelector(
        '[name="entrada"]'
      )
      ?.value ||
    '';


  const modoFixo =
    modalidade.value ===
      'fixos' ||
    modalidade.value ===
      'misto';


  if (
    !modoFixo ||
    (
      parcelas <= 0 &&
      !entrada
    )
  ) {

    bloco
      .classList
      .add(
        'hidden'
      );


    rows.innerHTML =
      '';


    return;
  }


  bloco
    .classList
    .remove(
      'hidden'
    );


  if (
    !force &&
    rows.querySelector(
      '.schedule-row'
    )
  ) {

    return;
  }


  const parcelaValor =
    form
      .querySelector(
        '[name="valorParcela"]'
      )
      ?.value ||
    '';


  const primeiroVencimento =
    form
      .querySelector(
        '[name="primeiroVencimento"]'
      )
      ?.value ||
    '';


  const diaSeguinte =
    form
      .querySelector(
        '[name="diaVencimento"]'
      )
      ?.value ||
    '';


  const dataDocumento =
    form
      .querySelector(
        '[name="dataDocumento"]'
      )
      ?.value ||
    '';


  const base =
    parseDateLocal(
      primeiroVencimento
    );


  const itens = [];


  if (
    entrada
  ) {

    itens.push({

      tipo:
        'Entrada',

      vencimento:
        dataDocumento ||
        primeiroVencimento,

      valor:
        entrada
    });
  }


  for (
    let i = 0;
    i < parcelas;
    i++
  ) {

    let vencimento =
      '';


    if (
      base
    ) {

      const data =
        i === 0

          ? base

          : addMonthsWithDay(
              base,
              i,
              diaSeguinte
            );


      vencimento =
        toDateInput(
          data
        );
    }


    itens.push({

      tipo:
        `Parcela ${i + 1}`,

      vencimento:
        vencimento,

      valor:
        parcelaValor
    });
  }


  rows.innerHTML =
    itens
      .map(
        item => `

          <div class="schedule-row">

            <div class="schedule-label">
              ${item.tipo}
            </div>

            <label>

              Vencimento

              <input
                type="date"
                class="schedule-date"
                value="${item.vencimento || ''}"
              >

            </label>

            <label>

              Valor

              <input
                type="text"
                inputmode="numeric"
                class="schedule-value"
                value="${item.valor || ''}"
                placeholder="R$ 0,00"
              >

            </label>

          </div>
        `
      )
      .join('');
}


/************************************************************
 * LÊ CRONOGRAMA
 ************************************************************/

function getInstallmentSchedule() {

  return [
    ...document.querySelectorAll(
      '#installmentScheduleRows .schedule-row'
    )
  ]
    .map(
      row => ({

        tipo:
          row
            .querySelector(
              '.schedule-label'
            )
            ?.textContent
            .trim() ||
          '',

        vencimento:
          row
            .querySelector(
              '.schedule-date'
            )
            ?.value ||
          '',

        valor:
          row
            .querySelector(
              '.schedule-value'
            )
            ?.value ||
          ''
      })
    );
}


/************************************************************
 * HONORÁRIOS
 ************************************************************/

function updateHonorariumFields() {

  const value =
    modalidade.value;


  const fixed =
    value ===
      'fixos' ||
    value ===
      'misto';


  const success =
    value ===
      'exito' ||
    value ===
      'misto';


  fixedFields
    .classList
    .toggle(
      'hidden',
      !fixed
    );


  successFields
    .classList
    .toggle(
      'hidden',
      !success
    );


  renderInstallmentSchedule(
    true
  );
}


/************************************************************
 * DOCUMENTOS
 ************************************************************/

function getSelectedDocuments() {

  return [
    ...form.querySelectorAll(
      'input[name="documentos"]:checked'
    )
  ]
    .map(
      input =>
        input.value
    );
}


/************************************************************
 * PAYLOAD
 ************************************************************/

function collectPayload() {

  const data =
    new FormData(form);


  return {

    contratantes:
      getContractors(),


    servico: {

      areaDireito:
        data.get(
          'areaDireito'
        ) ||
        '',

      tipoServico:
        data.get(
          'tipoServico'
        ) ||
        '',

      descricaoObjeto:
        data.get(
          'descricaoObjeto'
        ) ||
        '',

      parteContraria:
        data.get(
          'parteContraria'
        ) ||
        '',

      numeroProcesso:
        data.get(
          'numeroProcesso'
        ) ||
        '',

      varaForo:
        data.get(
          'varaForo'
        ) ||
        '',

      observacoes:
        data.get(
          'observacoes'
        ) ||
        ''
    },


    honorarios: {

      modalidade:
        data.get(
          'modalidade'
        ) ||
        '',

      formaPagamento:
        data.get(
          'formaPagamento'
        ) ||
        '',

      primeiroVencimento:
        data.get(
          'primeiroVencimento'
        ) ||
        '',

      valorTotal:
        data.get(
          'valorTotal'
        ) ||
        '',

      entrada:
        data.get(
          'entrada'
        ) ||
        '',

      parcelas:
        data.get(
          'parcelas'
        ) ||
        '',

      valorParcela:
        data.get(
          'valorParcela'
        ) ||
        '',

      diaVencimento:
        data.get(
          'diaVencimento'
        ) ||
        '',

      observacoes:
        data.get(
          'observacoesHonorarios'
        ) ||
        '',

      percentualExito:
        data.get(
          'percentualExito'
        ) ||
        '',

      baseCalculoExito:
        data.get(
          'baseCalculoExito'
        ) ||
        '',

      momentoExito:
        data.get(
          'momentoExito'
        ) ||
        '',

      cronograma:
        getInstallmentSchedule()
    },


    documentos:
      getSelectedDocuments(),


    assinatura: {

      cidade:
        data.get(
          'cidadeAssinatura'
        ) ||
        '',

      data:
        data.get(
          'dataDocumento'
        ) ||
        ''
    },


    modeloContratoId:
      APP_CONFIG
        .contractTemplateId
  };
}


/************************************************************
 * VALIDAÇÃO
 ************************************************************/

function validatePayload(payload) {

  if (
    !payload.contratantes.length
  ) {

    return (
      'Informe pelo menos um contratante.'
    );
  }


  if (
    !payload.documentos.length
  ) {

    return (
      'Selecione pelo menos um documento.'
    );
  }


  if (
    !payload.servico.areaDireito ||
    !payload.servico.tipoServico ||
    !payload.servico.descricaoObjeto
  ) {

    return (
      'Preencha os dados obrigatórios do serviço.'
    );
  }


  if (
    !payload.honorarios.modalidade
  ) {

    return (
      'Selecione a modalidade dos honorários.'
    );
  }


  if (
    !payload.assinatura.cidade ||
    !payload.assinatura.data
  ) {

    return (
      'Informe cidade e data do documento.'
    );
  }


  return '';
}


/************************************************************
 * ENVIO PARA APPS SCRIPT
 ************************************************************/

async function submitForm(event) {

  event.preventDefault();


  if (
    !form.reportValidity()
  ) {

    return;
  }


  const payload =
    collectPayload();


  const erro =
    validatePayload(
      payload
    );


  if (
    erro
  ) {

    showToast(
      erro,
      'error'
    );

    return;
  }


  const button =
    form.querySelector(
      'button[type="submit"]'
    );


  const textoOriginal =
    button.textContent;


  button.disabled =
    true;


  button.textContent =
    'Gerando documentos...';


  try {

    const response =
      await fetch(
        APP_CONFIG.backendUrl,
        {

          method:
            'POST',

          headers: {

            'Content-Type':
              'text/plain;charset=utf-8'
          },

          body:
            JSON.stringify(
              payload
            )
        }
      );


    const result =
      await response.json();


    if (
      result.ok === false
    ) {

      throw new Error(
        result.message ||
        'Erro ao gerar documentos.'
      );
    }


    showToast(
      'Documentos gerados e enviados por e-mail com sucesso.',
      'success'
    );


  } catch (error) {

    console.error(
      error
    );


    showToast(
      error.message ||
      'Erro de comunicação com o servidor.',
      'error'
    );


  } finally {

    button.disabled =
      false;


    button.textContent =
      textoOriginal;
  }
}


/************************************************************
 * DATA
 ************************************************************/

function configureInitialDate() {

  const input =
    form.querySelector(
      '[name="dataDocumento"]'
    );


  if (
    input.value
  ) {

    return;
  }


  const hoje =
    new Date();


  const local =
    new Date(
      hoje.getTime() -
      hoje.getTimezoneOffset() *
      60000
    );


  input.value =
    local
      .toISOString()
      .slice(
        0,
        10
      );
}


/************************************************************
 * BACKEND
 ************************************************************/

function updateBackendStatus() {

  if (
    APP_CONFIG.backendUrl
  ) {

    backendStatus.textContent =
      'Backend conectado';


    backendStatus.style.background =
      '#ecfdf3';


    backendStatus.style.color =
      '#027a48';

  } else {

    backendStatus.textContent =
      'Backend não configurado';
  }
}


/************************************************************
 * INPUT
 ************************************************************/

form.addEventListener(
  'input',
  event => {

    const target =
      event.target;


    /* NOME */

    if (
      target.dataset?.field ===
      'nomeCompleto'
    ) {

      target.value =
        upperName(
          target.value
        );
    }


    /* PARTE CONTRÁRIA */

    if (
      target.name ===
      'parteContraria'
    ) {

      target.value =
        upperName(
          target.value
        );
    }


    /* CPF */

    if (
      target.dataset?.field ===
      'cpf'
    ) {

      target.value =
        formatCPF(
          target.value
        );
    }


    /* RG */

    if (
      target.dataset?.field ===
      'rg'
    ) {

      target.value =
        formatRG(
          target.value
        );
    }


    /* CELULAR */

    if (
      target.dataset?.field ===
      'telefone'
    ) {

      target.value =
        formatPhone(
          target.value
        );
    }


    /* CEP */

    if (
      target.dataset?.field ===
      'cep'
    ) {

      target.value =
        formatCEP(
          target.value
        );
    }


    /* UF */

    if (
      target.dataset?.field ===
      'estado'
    ) {

      target.value =
        upperName(
          target.value
        )
          .slice(
            0,
            2
          );
    }


    /* MOEDA */

    if (
      [
        'valorTotal',
        'entrada',
        'valorParcela'
      ]
        .includes(
          target.name
        )
    ) {

      target.value =
        formatCurrencyBRL(
          target.value
        );


      renderInstallmentSchedule(
        true
      );
    }


    /* VALORES EDITADOS NO CRONOGRAMA */

    if (
      target.classList.contains(
        'schedule-value'
      )
    ) {

      target.value =
        formatCurrencyBRL(
          target.value
        );
    }


    /* RECALCULA PARCELAS */

    if (
      [
        'parcelas',
        'primeiroVencimento',
        'diaVencimento'
      ]
        .includes(
          target.name
        )
    ) {

      renderInstallmentSchedule(
        true
      );
    }


    /* PRÉVIA */

    if (
      target.closest(
        '.contractor-block'
      )
    ) {

      updateQualificationPreview();
    }
  }
);


/************************************************************
 * EVENTOS
 ************************************************************/

addContractorBtn
  .addEventListener(
    'click',
    addContractor
  );


previewBtn
  .addEventListener(
    'click',
    updateQualificationPreview
  );


modalidade
  .addEventListener(
    'change',
    updateHonorariumFields
  );


form.addEventListener(
  'submit',
  submitForm
);


/************************************************************
 * LIMPAR
 ************************************************************/

resetBtn.addEventListener(
  'click',
  () => {

    setTimeout(
      () => {

        contractorsContainer.innerHTML =
          '';


        contractorCount =
          0;


        addContractor();


        configureInitialDate();


        ensureDefaultObjectText();


        updateHonorariumFields();


        updateQualificationPreview();

      },
      0
    );
  }
);


/************************************************************
 * INICIALIZAÇÃO
 ************************************************************/

addContractor();

configureInitialDate();

ensureDefaultObjectText();

ensureInstallmentScheduleUI();

updateHonorariumFields();

updateQualificationPreview();

updateBackendStatus();
