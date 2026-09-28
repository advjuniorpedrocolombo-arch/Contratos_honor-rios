# Contratos_honor-rios

Interface web para geração de documentos jurídicos da Advocacia Colombo.

## Estrutura

- `index.html` — interface principal
- `style.css` — identidade visual e responsividade
- `app.js` — múltiplos contratantes, validação, prévia e integração com backend

## Modelo oficial do contrato

O sistema foi preparado para usar o Google Docs existente:

`MODELO - Contrato de Prestação de Serviços Advocatícios Automático`

ID do modelo:

`1Xn-UzT6-35DihvQAiN6qsKHLS6gdI8TFP40hCyoHtxM`

O documento-base deve permanecer intacto. O backend deverá sempre criar uma cópia do modelo, preencher os marcadores e salvar o documento gerado na mesma estrutura de pasta do Google Drive.

## Próxima etapa

Publicar um Google Apps Script como Web App e informar a URL em `APP_CONFIG.backendUrl`, dentro de `app.js`.

O backend deverá receber JSON, gerar procuração e declaração individual por contratante e um contrato conjunto quando houver mais de um contratante.
