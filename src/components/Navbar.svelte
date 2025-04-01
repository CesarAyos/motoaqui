<nav class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <a class="navbar-brand text-white fs-2" href="/">Rapiditos Colón</a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navbarNav"
      aria-controls="navbarNav"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <i class="fa-solid fa-bars" style="color: #FFD43B;"></i>
    </button>
    <div class="collapse navbar-collapse" id="navbarNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item m-2">
          <a class="nav-link active medio text-white fs-5" aria-current="page" href="/">Inicio</a>
        </li>
        <li class="nav-item m-2">
          <a class="nav-link medio text-white fs-5" href="acerca">Acerca De</a>
        </li>
        <li class="nav-item m-2">
          <a class="nav-link medio text-white fs-5" href="servicio">Servicio</a>
        </li>
      </ul>
      <div class="btn-group dropstart m-2" >
        <button type="button" class="btn btn btn-outline-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-display="static">
          USUARIOS
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="loginUser">Iniciar sesión</a></li>
          <li><a class="dropdown-item" href="registroClient">Registrarse</a></li>
        </ul>
      </div>
      <div class="btn-group dropstart m-2">
        <button type="button" class="btn btn-outline-warning dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" data-bs-display="static">
          OPERADORES
        </button>
        <ul class="dropdown-menu dropdown-menu-end">
          <li><a class="dropdown-item" href="/operador">Operador</a></li>
          <li><a class="dropdown-item" href="loginDrivers">Conductor</a></li>
        </ul>
      </div>
    </div>
  </div>
</nav>


<style>
  .medio:hover {
    transition: 1s;
    border-radius: 15px;
    background: #ffd43b;
  }

  .navbar {
    background: #1b1b1b;
  }

  .btn-group .dropdown-menu {
    position: absolute;
  }

  @media (max-width: 768px) {
    .btn-group.dropstart .dropdown-menu {
      position: static;
      float: none;
    }
  }
</style>
