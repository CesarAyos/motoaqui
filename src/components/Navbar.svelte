<nav class="navbar navbar-expand-lg">
  <div class="container-fluid">
    <a class="navbar-brand text-white fs-2" href="/">Motoaqui</a>
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
      <ul class="navbar-nav">
        <li class="nav-item m-2">
          <a
            class="nav-link active medio text-white fs-5"
            aria-current="page"
            href="/">Inicio</a
          >
        </li>
        <li class="nav-item m-2">
          <a class="nav-link medio text-white fs-5" href="acerca">Acerca De</a>
        </li>
        <li class="nav-item m-2">
          <a class="nav-link medio text-white fs-5" href="servicio">Servicio</a>
        </li>
        <li class="nav-item d-none">
          <a class="nav-link disabled" aria-disabled="true">none</a>
        </li>
      </ul>
    </div>
    <div style="margin-right: 50px;">
      <div class="btn-group">
        <button
          class="btn btn-outline-warning dropdown-toggle"
          type="button"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          INGRESAR
        </button>
        <ul class="dropdown-menu">
          <li><a class="dropdown-item" href="loginUser">USUARIO</a></li>
          <li><a class="dropdown-item" href="loginDrivers">CONDUCTOR</a></li>
          <li><a class="dropdown-item" href="operador">OPERADOR</a></li>
        </ul>
      </div>
      <div class="btn-group">
        <button class="btn btn-outline-warning" type="button">
          REGISTRARSE
        </button>
        <button
          type="button"
          class="btn btn-outline-warning dropdown-toggle dropdown-toggle-split"
          data-bs-toggle="dropdown"
          aria-expanded="false"
        >
          <span class="visually-hidden">REGISTRARME</span>
        </button>
        <ul class="dropdown-menu">
          <li>
            <a class="dropdown-item" href="registroClient">NUEVO USUARIO</a>
          </li>
          <li>
            <a class="dropdown-item" href="registroDrivers">NUEVO CONDUCTOR</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</nav>

<!-- Large button groups (default and split) -->

<style>
  .medio:hover {
    transition: 1s;
    border-radius: 15px;
    background: #ffd43b;
  }

  .navbar {
    background: #1b1b1b;
  }
</style>
