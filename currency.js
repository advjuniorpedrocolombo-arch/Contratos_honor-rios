(() => {
  const moneyNames = new Set(['valorTotal', 'entrada', 'valorParcela']);

  function formatBRL(value) {
    const digits = String(value || '').replace(/\D/g, '');
    if (!digits) return '';
    const cents = Number(digits) / 100;
    return cents.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  }

  function isMoneyField(el) {
    return el instanceof HTMLInputElement && (
      moneyNames.has(el.name) || el.classList.contains('schedule-value')
    );
  }

  document.addEventListener('input', (event) => {
    const el = event.target;
    if (!isMoneyField(el)) return;
    el.value = formatBRL(el.value);
  });

  document.addEventListener('focusin', (event) => {
    const el = event.target;
    if (!isMoneyField(el) || !el.value) return;
    el.value = formatBRL(el.value);
  });

  window.formatBRL = formatBRL;
})();
