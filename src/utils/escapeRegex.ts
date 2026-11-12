// Escapa caracteres especiales de regex antes de usar texto de un usuario en
// una búsqueda ($regex de Mongo) — evita inyección de regex y ReDoS.
export function escapeRegex(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
