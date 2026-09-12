// script/supabase-client.js

// Dados do seu projeto no Supabase
const SUPABASE_URL = "https://dxadtdurxjfxbbttlngk.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4YWR0ZHVyeGpmeGJidHRsbmdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMDAxOTksImV4cCI6MjA5NDY3NjE5OX0.xVKaLcuu1bZjE56hWyz6rSxMLb1EXHmgbBoTTcYdilE";

// DIGITE AQUI O EMAIL DO SEU ADMINISTRADOR:
const EMAIL_ADMIN_OFICIAL = "apasbac.assis@gmail.com"; 

// Cria o cliente de conexão com o banco
const db = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);