const SUPABASE_URL = "https://dcruyugvpftdvqdcnjdl.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjcnV5dWd2cGZ0ZHZxZGNuamRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI3NDYxNjUsImV4cCI6MjA4ODMyMjE2NX0.ER8vVJXTYbQjteLe4iATn_nto4aoKgxMiZQ_P25y7QY";

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

//quando o usuario digitar (xx) xxx-xxx o que será salvo no banco de dados serão somente os numeros
function limparTelefone(numero){
  return numero.replace(/\D/g, "");
}  


// ================= CADASTRO =================
function mascaraTelefone(input){

  let numero = input.value.replace(/\D/g, "");

  // limita em 11 dígitos
  numero = numero.substring(0,11);

  // aplica máscara
  numero = numero.replace(/^(\d{2})(\d)/g, "($1) $2");
  numero = numero.replace(/(\d{5})(\d)/, "$1-$2");

  input.value = numero;
}

function mascaraCPF(input){

  let cpf = input.value.replace(/\D/g, "");

  // limita em 11 dígitos
  cpf = cpf.substring(0,11);

  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d)/, "$1.$2");
  cpf = cpf.replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  input.value = cpf;
}


// ================= VALIDAÇÃO DE SENHA =================
function validarSenha(){

  const senha =
    document.getElementById("senha").value;

  const confirmar =
    document.getElementById("confirmarSenha").value;

  const statusSenha =
    document.getElementById("statusSenha");

  const possuiNumero = /\d/.test(senha);
  const possuiLetra = /[A-Za-z]/.test(senha);
  const possuiSimbolo =
    /[!@#$%^&*(),.?":{}|<>]/.test(senha);

  // valida requisitos
  if(
    senha.length < 6 ||
    !possuiNumero ||
    !possuiLetra ||
    !possuiSimbolo
  ){

    statusSenha.innerHTML =
      "❌ Senha fraca";

    statusSenha.style.color = "red";

    return false;
  }

  // verifica confirmação
  if(confirmar.length > 0){

    if(senha !== confirmar){

      statusSenha.innerHTML =
        "❌ As senhas não coincidem";

      statusSenha.style.color = "red";

      return false;

    }else{

      statusSenha.innerHTML =
        "✔ Senha válida";

      statusSenha.style.color = "green";
    }
  }

  return true;
}


// ================= CADASTRAR =================
async function cadastrar(){

  const nome =
    document.getElementById("nome").value.trim();

  const telefone =
    limparTelefone(
      document.getElementById("telefone").value
    );

  const cpf =
    document.getElementById("cpf")
    .value
    .replace(/\D/g, "");

  const instituicao =
    document.getElementById("instituicao").value;

  const senha =
    document.getElementById("senha").value;

  // validação simples de telefone
  if(telefone.length !== 11){

    document.getElementById("msg").innerText =
      "Telefone inválido";

    return;
  }

  // validação simples de CPF
  if(cpf.length !== 11){

    document.getElementById("msg").innerText =
      "CPF inválido";

    return;
  }

  // valida senha
  if(!validarSenha()){

    document.getElementById("msg").innerText =
      "Verifique os requisitos da senha";

    return;
  }

  // valida campos
  if(!nome || !telefone || !cpf || !instituicao || !senha){

    document.getElementById("msg").innerText =
      "Preencha todos os campos";

    return;
  }

  // email automático para auth
  const emailFake = cpf + "@app.local";

  // cria usuário
  const { data, error } =
    await supabaseClient.auth.signUp({

      email: emailFake,
      password: senha
    });

  console.log("RESPOSTA SIGNUP:", data, error);

  if(error){

    document.getElementById("msg").innerText =
      error.message;

    return;
  }

  const userId = data.user.id;

  // salva dados extras
  const { error: erroDB } =
    await supabaseClient
      .from("usuarios")
      .insert({

        id: userId,
        nome: nome,
        telefone: telefone,
        cpf: cpf,
        instituicao: instituicao
      });

  document.getElementById("msg").innerText =
    erroDB
      ? erroDB.message
      : "Conta criada. Redirecionando...";

  setTimeout(() => {
    window.location.href = "login.html";
  }, 2000);
}


// ================= EVENTOS =================
window.addEventListener("DOMContentLoaded", () => {

  const senha =
    document.getElementById("senha");

  const confirmar =
    document.getElementById("confirmarSenha");

  if(senha && confirmar){

    senha.addEventListener(
      "input",
      validarSenha
    );

    confirmar.addEventListener(
      "input",
      validarSenha
    );
  }

});

// ================= LOGIN =================
async function login(){

  const cpf = document
    .getElementById("login")
    .value
    .replace(/\D/g, "");

  const senha = document  
    .getElementById("senha")
    .value
    .trim();

  // email automático baseado no CPF  
  const emailFake = cpf + "@app.local";

  const { error } = await supabaseClient.auth.signInWithPassword({
    email: emailFake,
    password: senha
  });  

  if(error){
    document.getElementById("msg").innerText =
      "CPF ou senha inválidos";
    return;  
  }  

  const { data: sessionData } =
    await supabaseClient.auth.getSession();

  const userId = sessionData.session.user.id;  

  const { data: usuario } = await supabaseClient
    .from("usuarios")
    .select("tipo")
    .eq("id", userId)
    .single();

  if(usuario.tipo === "admin"){
    window.location.href = "admin.html";
  }else{
    window.location.href = "presenca.html";
  }  
}  
function mostrarSenha(){

  const senha =
    document.getElementById("senha");

  const confirmar =
    document.getElementById("confirmarSenha");

  const texto =
    document.getElementById("toggleSenha");

  const visivel =
    senha.type === "text";

  senha.type =
    visivel ? "password" : "text";

  if(confirmar){
    confirmar.type =
      visivel ? "password" : "text";
  }

  if(texto){
    texto.innerHTML =
      visivel
        ? "👁 Mostrar senha"
        : "🙈 Ocultar senha";
  }
}


// ================= LOGOUT =================
async function logout(){
  await supabaseClient.auth.signOut();
  window.location.href = "login.html";
}


// 🔴 MUITO IMPORTANTE — fora das funções
window.login = login;
window.cadastrar = cadastrar;
window.logout = logout;

// ================= MARCAR PRESENÇA =================
async function marcarPresenca(){

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session){

    window.location.href = "login.html";

    return;
  }

  const userId =
    data.session.user.id;

  // tenta inserir direto
  const { error } =
    await supabaseClient
      .from("presencas")
      .insert({

        user_id: userId,

        status_ida: "aguardando_ida",
        status_volta: "aguardando_volta"
      });

  const msg =
    document.getElementById("msg");

  if(error){

    if(error.message.includes("duplicate key")){

      msg.innerText =
        "Você já marcou presença hoje ✔️";

    }else{

      msg.innerText =
        "Erro ao marcar presença";

      console.log(error);
    }

    return;
  }

  msg.innerText =
    "Presença registrada com sucesso 🎉";

  carregarStatusAtual();
}


// ================= STATUS DE RETORNO =================
async function atualizarStatus(novoStatus){

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session){

    window.location.href = "login.html";

    return;
  }

  const userId =
    data.session.user.id;

  // busca última presença do usuário
  const { data: ultimaPresenca, error: erroBusca } =
    await supabaseClient
      .from("presencas")
      .select("id")
      .eq("user_id", userId)
      .order("data_presenca", {
        ascending:false
      })
      .limit(1)
      .single();

  if(erroBusca || !ultimaPresenca){

    console.log(erroBusca);

    document.getElementById("statusAtual").innerText =
      "Marque presença primeiro";

    return;
  }

  // atualiza status
  const { error } =
    await supabaseClient
      .from("presencas")
      .update({

        status_retorno: novoStatus

      })
      .eq("id", ultimaPresenca.id);

  const statusAtual =
    document.getElementById("statusAtual");

  if(error){

    statusAtual.innerText =
      "Erro ao atualizar status";

    console.log(error);

    return;
  }

  const textos = {

    aguardando:
      "⏳ Aguardando ônibus",

    embarcado:
      "🚌 Embarque confirmado",

    nao_volta:
      "❌ Você não retorna hoje",

    cheguei:
      "🏠 Chegada confirmada"
  };

  statusAtual.innerText =
    textos[novoStatus];
}

// ================= CARREGAR STATUS =================
async function carregarStatusAtual(){

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session) return;

  const userId =
    data.session.user.id;

  const { data: ultimaPresenca, error } =
    await supabaseClient
      .from("presencas")
      .select(`
        status_ida,
        status_volta
      `)
      .eq("user_id", userId)
      .order("created_at", {
        ascending:false
      })
      .limit(1)
      .single();

  if(error || !ultimaPresenca){
    console.log(error);
    return;
  }

  const statusAtual =
    document.getElementById("statusAtual");

  if(!statusAtual) return;

  const textosIda = {

    aguardando_ida:
      "⏳ Aguardando ida",

    embarcou_ida:
      "🚌 Embarcou",

    chegou_faculdade:
      "🏫 Chegou na faculdade"
  };

  const textosVolta = {

    aguardando_volta:
      "⏳ Aguardando volta",

    embarcado_volta:
      "🚌 Embarcou na volta",

    nao_volta:
      "❌ Não volta hoje",

    cheguei_casa:
      "🏠 Chegou em casa"
  };

  statusAtual.innerHTML = `

    <p>
      <b>IDA:</b>
      ${textosIda[ultimaPresenca.status_ida] || "-"}
    </p>

    <p>
      <b>VOLTA:</b>
      ${textosVolta[ultimaPresenca.status_volta] || "-"}
    </p>

  `;
}


// ================= NÃO VOLTO =================
async function naoVouVoltar(){

  atualizarStatus("nao_volta");
}
// ================= HISTÓRICO =================
async function carregarHistorico(){

  const { data } = await supabaseClient.auth.getSession();

  if(!data.session){
    window.location.href = "login.html";
    return;
  }

  const userId = data.session.user.id;

 const hoje = new Date()
  .toISOString()
  .split("T")[0];

const { data: presencas, error } =
  await supabaseClient
    .from("presencas")
    .select("id, data_presenca")
    .eq("user_id", userId)
    .gte("data_presenca", hoje)
    .order("data_presenca", {
      ascending:false
    });

  const lista = document.getElementById("lista");

  if(error){
    lista.innerHTML = "Erro ao carregar histórico";
    console.log(error);
    return;
  }

  if(!presencas || presencas.length === 0){
    lista.innerHTML = "<p>Nenhuma presença registrada.</p>";
    return;
  }

  lista.innerHTML = presencas.map(p =>
    `<p>📅 ${p.data_presenca}</p>`
  ).join("");
}

async function carregarPresencasAdmin(){

  const { data: sessionData } =
    await supabaseClient.auth.getSession();

  if(!sessionData.session){

    window.location.href = "login.html";

    return;
  }

  const listaIda =
  document.getElementById("listaIda");

const listaVolta =
  document.getElementById("listaVolta");

listaIda.innerHTML = "Carregando...";
listaVolta.innerHTML = "Carregando...";

  // buscar presenças
  const { data: presencas, error } =
    await supabaseClient
      .from("presencas")
      .select("*")
      .order("data_presenca", {
        ascending:false
      });

  if(error){

   listaIda.innerHTML =
  "Erro ao carregar";

  listaVolta.innerHTML =
  "Erro ao carregar";

    console.log(error);

    return;
  }

  // buscar usuários
  const { data: usuarios } =
    await supabaseClient
      .from("usuarios")
      .select("id, nome, cpf, instituicao");

  if(!presencas || presencas.length === 0){

    listaIda.innerHTML =
  "<p>Nenhuma presença encontrada.</p>";

    listaVolta.innerHTML =
  "<p>Nenhuma presença encontrada.</p>";

    return;
  }

  listaIda.innerHTML = "";
  listaVolta.innerHTML = "";

  presencas.forEach(p => {

  const usuario =
    usuarios.find(u =>
      u.id === p.user_id
    );

  // ================= IDA =================

  const statusIda =
    p.status_ida || "aguardando_ida";

  const nomesIda = {

    aguardando_ida:
      "⏳ Aguardando ida",

    embarcou_ida:
      "🚌 Embarcou",

    chegou_faculdade:
      "🏫 Chegou na faculdade"
  };

  const divIda =
    document.createElement("div");

  divIda.className =
    "card-aluno";

  divIda.innerHTML = `

    <div class="topo">

      <div class="nome">
        ${usuario?.nome || "Aluno"}
      </div>

    </div>

    <div class="info">
      📱 ${usuario?.telefone || "-"}
    </div>

    <div class="info">
      🎓 ${usuario?.instituicao || "-"}
    </div>

    <div class="status ${statusIda}">
      ${nomesIda[statusIda]}
    </div>

  `;

  listaIda.appendChild(divIda);

  // ================= VOLTA =================

  const statusVolta =
    p.status_volta || "aguardando_volta";

  const nomesVolta = {

    aguardando_volta:
      "⏳ Aguardando volta",

    embarcado_volta:
      "🚌 Embarcou",

    nao_volta:
      "❌ Não volta",

    cheguei_casa:
      "🏠 Chegou em casa"
  };

  const divVolta =
    document.createElement("div");

  divVolta.className =
    "card-aluno";

  divVolta.innerHTML = `

    <div class="topo">

      <div class="nome">
        ${usuario?.nome || "Aluno"}
      </div>

    </div>

    <div class="info">
      📱 ${usuario?.telefone || "-"}
    </div>

    <div class="info">
      🎓 ${usuario?.instituicao || "-"}
    </div>

    <div class="status ${statusVolta}">
      ${nomesVolta[statusVolta]}
    </div>

  `;

  listaVolta.appendChild(divVolta);
});
}

// ================= CANCELAR PRESENÇA =================
async function cancelarPresenca(){

  const confirmar = confirm(
    "Deseja realmente cancelar sua presença de hoje?"
  );

  if(!confirmar) return;

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session){

    window.location.href = "login.html";

    return;
  }

  const userId =
    data.session.user.id;

  // busca última presença
  const { data: ultimaPresenca } =
    await supabaseClient
      .from("presencas")
      .select("id")
      .eq("user_id", userId)
      .order("data_presenca", {
        ascending:false
      })
      .limit(1)
      .single();

  if(!ultimaPresenca){

    document.getElementById("msg").innerText =
      "Nenhuma presença encontrada";

    return;
  }

  // remove presença
  const { error } =
    await supabaseClient
      .from("presencas")
      .delete()
      .eq("id", ultimaPresenca.id);

  // erro ao deletar
  if(error){

    document.getElementById("msg").innerText =
      "Erro ao cancelar presença";

    console.log(error);

    return;
  }

  // sucesso
  document.getElementById("msg").innerText =
    "Presença cancelada com sucesso ✔️";

  // limpa status visual
  const statusAtual =
    document.getElementById("statusAtual");

  if(statusAtual){
    statusAtual.innerText = "";
  }

  // atualiza histórico
  carregarHistorico();

  // limpa histórico imediatamente se vazio
  const lista =
    document.getElementById("lista");

  if(lista){
    lista.innerHTML = "Atualizando...";
  }
}

window.cancelarPresenca = cancelarPresenca;

// ================= STATUS IDA =================
async function atualizarStatusIda(status){

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session) return;

  const userId =
    data.session.user.id;

  const { data: ultimaPresenca } =
    await supabaseClient
      .from("presencas")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", {
        ascending:false
      })
      .limit(1)
      .single();

  if(!ultimaPresenca) return;

  const { error } =
    await supabaseClient
      .from("presencas")
      .update({

        status_ida: status

      })
      .eq("id", ultimaPresenca.id);

  if(error){

    console.log(error);

    return;
  }

  carregarStatusAtual();
}

// ================= STATUS VOLTA =================
async function atualizarStatusVolta(status){

  const { data } =
    await supabaseClient.auth.getSession();

  if(!data.session) return;

  const userId =
    data.session.user.id;

  const { data: ultimaPresenca } =
    await supabaseClient
      .from("presencas")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", {
        ascending:false
      })
      .limit(1)
      .single();

  if(!ultimaPresenca) return;

  const { error } =
    await supabaseClient
      .from("presencas")
      .update({

        status_volta: status

      })
      .eq("id", ultimaPresenca.id);

  if(error){

    console.log(error);

    return;
  }

  carregarStatusAtual();
}
window.atualizarStatusIda =
  atualizarStatusIda;

window.atualizarStatusVolta =
  atualizarStatusVolta;
  window.mostrarSenha =
  mostrarSenha;