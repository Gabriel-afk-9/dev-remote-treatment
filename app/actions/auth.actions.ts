"use server";

import { createClient } from "@/libs/supabase/server";
import { redirect } from "next/navigation";

export async function loginAction(prevState: any, formData: FormData) {
  const login = formData.get("login") as string;
  const senha = formData.get("senha") as string;

  const supabase = await createClient();

  // Supabase usa o e-mail como identificador principal
  const { error } = await supabase.auth.signInWithPassword({
    email: login,
    password: senha,
  });

  if (error) {
    return { error: "Credenciais inválidas. Verifique o login e a senha." };
  }

  // Redireciona para o painel em caso de sucesso
  redirect("/admin/painel");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  
  redirect("/admin/login");
}