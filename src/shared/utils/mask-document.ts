export function maskPartialDocument(value: string): string {
  if (!value) return "";

  // Remove todos os caracteres não numéricos
  const numbers = value.replace(/\D/g, "");

  if (!numbers) return value;

  // CPF: 11 dígitos - Formato: ***.XXX.XXX-**
  if (numbers.length === 11) {
    return `***.${numbers.slice(3, 6)}.${numbers.slice(6, 9)}-**`;
  }

  // CNPJ: 14 dígitos - Formato: **.XXX.XXX/****-XX
  if (numbers.length === 14) {
    return `**.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}/****-${numbers.slice(12, 14)}`;
  }

  // Se não tem tamanho válido, retorna o valor original
  return value;
}
