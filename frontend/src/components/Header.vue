<template>
  <header class="header">
    <!-- Logo -->
    <div class = "header-left">
      <img src="../assets/logo_musicSPace.png" alt="Logo" class="logo" />
    

    <!-- Icone home -->
    
      <button class="home-btn" @click="$router.push('/')">
          <img src="../icons/home.svg" class="home-icon" />
      </button>
    <!-- Barra de búsqueda -->
    <div class="search-bar">
      <i class="fas fa-search search-icon"></i>
      <input type="text" placeholder="Què vols reproduir?" />
      <i class="fas search-end"></i>
    </div>
    </div>

    <!-- Navegació dreta -->
    <nav class="header-right">
      <a href="#">Assistència</a>
      <span class="divider"></span>
      <a href="#">Registrar-se</a>
      <button class="login-btn">Iniciar sessió</button>
    </nav>
  </header>
</template>

<script setup>
// No cal JS addicional per aquesta versió bàsica
</script>

<style scoped>
.header {
  
  display: flex;
  width: 100%;    
  align-items: center;
  justify-content: space-between;
  background-color: #000000;
  color: #fff;
  padding: 10px 24px;
  height: 64px;
  font-family: 'Open Sans', sans-serif;
}

.header-left{
  display: flex;
  align-items: center;
  gap: 16px;           /* separació entre logo, home i cercador */
  flex: 1;            /* ← clau: ocupa tot l'espai disponible */
  min-width: 0;       /* evita que el flex-item limiti l’ample del fill */
  height: 64px;
}

.logo {
  width: 110px;
  height: 54px;
}
.home-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background-color: #1a1a1a;       /* cercle fosc */
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

/* icona de la casa */
.home-icon {
  width: 22px;
  height: 22px;
  color: #ffffff;                  /* casa rosa corporativa */
  transition: color 0.3s ease;
}

/* efecte hover: cercle més clar i icona blanca */
.home-btn:hover {
  background-color: #2a2a2a;
}

.home-btn:hover .home-icon {
  color: #fff;
}

.icon-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: #1e1e1e;
  border-radius: 30px;
  padding: 6px 14px;
  width: 40%;
  height: 60%;
  max-width: 500px;
}

.search-bar input {
  background: transparent;
  border: none;
  color: #ffffff;
  width: 100%;
  outline: none;
  font-size: 14px;
}

.search-icon,
.search-end {
  color: #aaa;
  margin-right: 10px;
  font-size: 14px;
}

.search-end {
  margin-left: 8px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  font-weight: 600;
}

.header-right a {
  text-decoration: none;
  color: #c3c2c2;
  transition: color 0.2s ease;
  font-size: 14px;
}

.header-right a:hover {
  color: #fff;
}

.divider {
  width: 1px;
  height: 20px;
  background-color: #444;
}

.login-btn {
  background-color: #ffffff;
  color: #000;
  border: none;
  border-radius: 30px;
  padding: 8px 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover {
  background-color: #e0e0e0;
}
</style>
