const routes = {
  '/': 'html/home.html',
  '/index.html': 'html/home.html',
  '/projetos': 'html/projetos.html',
  '/cadastro': 'html/cadastro.html'
};

const app = document.querySelector('#app');
const menuToggle = document.querySelector('#menuToggle');
const menuLinks = document.querySelector('#menuLinks');

function normalizarRota(pathname) {
  if (pathname === '/index.html') return '/';
  return pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
}

function fecharMenu() {
  menuLinks.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.querySelector('.sr-only').textContent = 'Abrir menu';
}

function abrirOuFecharMenu() {
  const aberto = menuLinks.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(aberto));
  menuToggle.querySelector('.sr-only').textContent = aberto ? 'Fechar menu' : 'Abrir menu';
}

async function carregarRota(pathname, adicionarHistorico = false) {
  const rota = normalizarRota(pathname);
  const arquivo = routes[rota] || routes['/'];

  if (adicionarHistorico && rota !== normalizarRota(window.location.pathname)) {
    window.history.pushState({}, '', rota);
  }

  app.setAttribute('aria-busy', 'true');
  app.innerHTML = '<div class="loading" role="status">Carregando conteúdo...</div>';

  try {
    const resposta = await fetch(arquivo);
    if (!resposta.ok) throw new Error('Não foi possível carregar o conteúdo.');
    app.innerHTML = await resposta.text();
    inicializarPagina(rota);
    document.title = rota === '/projetos' ? 'Patas de Esperança | Projetos' : rota === '/cadastro' ? 'Patas de Esperança | Participe' : 'Patas de Esperança';
    app.focus({ preventScroll: true });
  } catch (erro) {
    app.innerHTML = '<section class="conteudo"><div class="alert" role="alert"><strong>Ops!</strong> Não foi possível carregar esta página. Tente novamente.</div></section>';
    console.error(erro);
  } finally {
    app.setAttribute('aria-busy', 'false');
  }
}

function inicializarPagina(rota) {
  document.querySelectorAll('[data-route]').forEach(link => {
    link.addEventListener('click', event => {
      const url = new URL(link.href, window.location.origin);
      if (url.origin !== window.location.origin) return;
      event.preventDefault();
      fecharMenu();
      carregarRota(url.pathname, true);
    });
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    const ativo = normalizarRota(new URL(link.href, window.location.origin).pathname) === rota;
    link.setAttribute('aria-current', ativo ? 'page' : 'false');
  });

  if (rota === '/projetos') inicializarProjetos();
  if (rota === '/cadastro') inicializarCadastro();
}

function inicializarProjetos() {
  const modal = document.querySelector('#modalAjuda');
  const abrir = document.querySelector('#abrirModal');
  const fechar = document.querySelector('#fecharModal');
  if (!modal || !abrir || !fechar) return;

  abrir.addEventListener('click', () => modal.showModal());
  fechar.addEventListener('click', () => modal.close());
  modal.addEventListener('click', event => {
    if (event.target === modal) modal.close();
  });
}

function inicializarCadastro() {
  const form = document.querySelector('#cadastroForm');
  const toast = document.querySelector('#toastSucesso');
  const salvo = document.querySelector('#cadastroSalvo');
  if (!form || !toast) return;

  const aplicarMascara = (seletor, funcao) => {
    const campo = document.querySelector(seletor);
    if (campo) campo.addEventListener('input', event => { event.target.value = funcao(event.target.value); });
  };

  aplicarMascara('#cpf', mascaraCPF);
  aplicarMascara('#cep', mascaraCEP);
  aplicarMascara('#telefone', mascaraTelefone);

  const cadastroAnterior = JSON.parse(localStorage.getItem('patasCadastro') || 'null');
  if (cadastroAnterior && cadastroAnterior.nome) {
    salvo.hidden = false;
    salvo.textContent = `Cadastro local encontrado para ${cadastroAnterior.nome}.`;
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const dados = Object.fromEntries(new FormData(form).entries());
    localStorage.setItem('patasCadastro', JSON.stringify({
      nome: dados.nome,
      email: dados.email,
      participacao: dados.participacao,
      salvoEm: new Date().toISOString()
    }));

    toast.hidden = false;
    window.setTimeout(() => { toast.hidden = true; }, 4500);
    salvo.hidden = false;
    salvo.textContent = `Cadastro local salvo para ${dados.nome}.`;
  });
}

function mascaraCPF(valor) {
  return valor.replace(/\D/g, '').slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

function mascaraCEP(valor) {
  const limpo = valor.replace(/\D/g, '').slice(0, 8);
  return limpo.length > 5 ? `${limpo.slice(0, 5)}-${limpo.slice(5)}` : limpo;
}

function mascaraTelefone(valor) {
  const limpo = valor.replace(/\D/g, '').slice(0, 11);
  if (limpo.length > 10) return limpo.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  if (limpo.length > 6) return limpo.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  if (limpo.length > 2) return limpo.replace(/^(\d{2})(\d+)/, '($1) $2');
  return limpo;
}

window.apoioApp = function apoioApp() {
  return {
    apoios: Number(localStorage.getItem('patasApoios') || 127),
    registrarApoio() {
      this.apoios += 1;
      localStorage.setItem('patasApoios', String(this.apoios));
    }
  };
};

menuToggle.addEventListener('click', abrirOuFecharMenu);
window.addEventListener('popstate', () => { fecharMenu(); carregarRota(window.location.pathname); });
window.addEventListener('keydown', event => { if (event.key === 'Escape') fecharMenu(); });

carregarRota(window.location.pathname);
