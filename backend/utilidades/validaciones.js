
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function correoVal(correo) {
  if (typeof correo !== 'string') return false;
  return REGEX_CORREO.test(correo.trim());
}

function passVal(pass) {
  if (typeof pass !== 'string') return false;
  if (pass.length < 8) return false;

  const may = /[A-Z]/.test(pass);
  const min = /[a-z]/.test(pass);
  const num = /[0-9]/.test(pass);

  return may && min && num;
}


function telVal(tel) {
  if (typeof tel !== 'string') return false;

  const soloDig = tel.replace(/\D/g, '');
  const es10dig = soloDig.length === 10;
  const es12dig = soloDig.length === 12 && soloDig.startsWith('52');

  return es10dig || es12dig;
}

module.exports = { correoVal, passVal, telVal };