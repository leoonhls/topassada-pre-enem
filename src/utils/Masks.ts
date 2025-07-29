export const cnpjMask = (value: string) => {
  return value
    .replace(/\D+/g, "") // não deixa ser digitado nenhuma letra
    .replace(/(\d{2})(\d)/, "$1.$2") // captura 2 grupos de número o primeiro com 2 digitos e o segundo de com 3 digitos, apos capturar o primeiro grupo ele adiciona um ponto antes do segundo grupo de número
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2") // captura 2 grupos de número o primeiro e o segundo com 3 digitos, separados por /
    .replace(/(\d{4})(\d)/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1"); // captura os dois últimos 2 números, com um - antes dos dois números
};

export const cpfMask = (value: string) => {
  return value
    .replace(/\D+/g, "") // Remove tudo que não é dígito
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após os 3 primeiros dígitos
    .replace(/(\d{3})(\d)/, "$1.$2") // Coloca ponto após os 6 primeiros dígitos
    .replace(/(\d{3})(\d{1,2})/, "$1-$2") // Coloca hífen após os 9 primeiros dígitos
    .replace(/(-\d{2})\d+?$/, "$1"); // Permite digitar apenas 2 dígitos após o hífen
};

export const phoneMask = (value: string) => {
  return value
    .replace(/\D+/g, "") // Remove tudo que não é dígito
    .replace(/(\d{2})(\d)/, "($1) $2") // Coloca parênteses no DDD
    .replace(/(\d{4,5})(\d{4})$/, "$1-$2"); // Coloca hífen antes dos 4 últimos dígitos
};

export const cepMask = (value: string) => {
  return value
    .replace(/\D+/g, "") // Remove tudo que não é dígito
    .replace(/(\d{5})(\d)/, "$1-$2") // Coloca hífen após os 5 primeiros dígitos
    .replace(/(-\d{3})\d+?$/, "$1"); // Permite digitar apenas 3 dígitos após o hífen
};

export const validateCPF = (cpf: string) => {
  // Remove caracteres não numéricos
  cpf = cpf.replace(/[^\d]+/g, "");

  // Verifica se tem 11 dígitos ou se é uma sequência de dígitos repetidos
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Calcula o primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Calcula o segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(10))) {
    return false;
  }

  return true;
};
