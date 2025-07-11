// Tipos de identificación tributaria por país sudamericano
export const SOUTH_AMERICAN_COUNTRIES = {
  AR: {
    name: 'Argentina',
    taxType: 'CUIT',
    fullName: 'Clave Única de Identificación Tributaria',
    format: 'XX-XXXXXXXX-X',
    description: 'Formato: 20-12345678-9'
  },
  BO: {
    name: 'Bolivia',
    taxType: 'NIT',
    fullName: 'Número de Identificación Tributaria',
    format: 'XXXXXXXXX',
    description: 'Formato: 123456789'
  },
  BR: {
    name: 'Brasil',
    taxType: 'CNPJ',
    fullName: 'Cadastro Nacional da Pessoa Jurídica',
    format: 'XX.XXX.XXX/XXXX-XX',
    description: 'Formato: 12.345.678/0001-90'
  },
  CL: {
    name: 'Chile',
    taxType: 'RUT',
    fullName: 'Rol Único Tributario',
    format: 'XXXXXXXX-X',
    description: 'Formato: 12345678-9'
  },
  CO: {
    name: 'Colombia',
    taxType: 'NIT',
    fullName: 'Número de Identificación Tributaria',
    format: 'XXXXXXXXX-X',
    description: 'Formato: 123456789-1'
  },
  EC: {
    name: 'Ecuador',
    taxType: 'RUC',
    fullName: 'Registro Único de Contribuyentes',
    format: 'XXXXXXXXXXX',
    description: 'Formato: 12345678901'
  },
  PE: {
    name: 'Perú',
    taxType: 'RUC',
    fullName: 'Registro Único de Contribuyentes',
    format: 'XXXXXXXXXXX',
    description: 'Formato: 12345678901'
  },
  PY: {
    name: 'Paraguay',
    taxType: 'RUC',
    fullName: 'Registro Único de Contribuyentes',
    format: 'XXXXXXXX-X',
    description: 'Formato: 12345678-9'
  },
  UY: {
    name: 'Uruguay',
    taxType: 'RUT',
    fullName: 'Registro Único Tributario',
    format: 'XXXXXXXXX',
    description: 'Formato: 123456789'
  },
  VE: {
    name: 'Venezuela',
    taxType: 'RIF',
    fullName: 'Registro Único de Información Fiscal',
    format: 'X-XXXXXXXX-X',
    description: 'Formato: J-12345678-9'
  }
} as const;

export type CountryCode = keyof typeof SOUTH_AMERICAN_COUNTRIES;

// Función para obtener el nombre completo del país
export function getCountryName(countryCode: CountryCode): string {
  return SOUTH_AMERICAN_COUNTRIES[countryCode]?.name || countryCode;
}

// Función para obtener el tipo de identificación tributaria
export function getTaxIdType(countryCode: CountryCode): string {
  return SOUTH_AMERICAN_COUNTRIES[countryCode]?.taxType || 'ID';
}

// Función para obtener el nombre completo del tipo de identificación
export function getTaxIdFullName(countryCode: CountryCode): string {
  return SOUTH_AMERICAN_COUNTRIES[countryCode]?.fullName || 'Identificación Tributaria';
}

// Función para obtener el formato del tipo de identificación
export function getTaxIdFormat(countryCode: CountryCode): string {
  return SOUTH_AMERICAN_COUNTRIES[countryCode]?.format || 'XXXXXXXXX';
}

// Función para obtener la descripción del formato
export function getTaxIdDescription(countryCode: CountryCode): string {
  return SOUTH_AMERICAN_COUNTRIES[countryCode]?.description || 'Formato estándar';
}

// Función para validar si un país es válido
export function isValidCountry(countryCode: string): countryCode is CountryCode {
  return countryCode in SOUTH_AMERICAN_COUNTRIES;
}

// Función para obtener todos los países disponibles
export function getAllCountries(): Array<{code: CountryCode, name: string, taxType: string}> {
  return Object.entries(SOUTH_AMERICAN_COUNTRIES).map(([code, data]) => ({
    code: code as CountryCode,
    name: data.name,
    taxType: data.taxType
  }));
}

// Función para formatear el texto del selector
export function formatCountryOption(countryCode: CountryCode): string {
  const country = SOUTH_AMERICAN_COUNTRIES[countryCode];
  return `${country.name} (${country.taxType})`;
} 