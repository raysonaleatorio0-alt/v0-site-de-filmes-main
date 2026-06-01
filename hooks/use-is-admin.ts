import { useAuth } from "./use-auth";

/**
 * COMO ADICIONAR ADMINS:
 * 
 * 1. Faça login na aplicação com sua conta Google
 * 2. Vá para http://localhost:3000/settings (ou navigate/settings)
 * 3. Copie seu email exibido na página
 * 4. Adicione seu email abaixo na lista ADMIN_EMAILS
 * 5. Faça refresh da página (F5)
 * 
 * Exemplo:
 * const ADMIN_EMAILS = [
 *   "seu-email@gmail.com",
 *   "outro-admin@gmail.com",
 * ];
 */

const ADMIN_EMAILS = [
  "raysononhas@gmail.com", // ← Seu email admin
];

export function useIsAdmin() {
  const { user } = useAuth();
  
  // Verifica se o email do usuário está na lista de admins
  return user?.email ? ADMIN_EMAILS.includes(user.email) : false;
}

