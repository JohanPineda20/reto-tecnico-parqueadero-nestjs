export function trimString(value: any) {
    return typeof value === 'string' ? value.trim() : value;
  }