# UB-ES-2025-C2

## SETUP:

### Paso 1: Instalar Docker Desktop

Entra en https://www.docker.com/products/docker-desktop/ y descarga la última versión de docker Desktop

### Paso 2: Preparar variables de entorno

Crea un archivo ".env" en la raíz del proyecto y escribe lo siguiente:

```
SECRET_KEY=(secret key, por ejempplo: django-insecure-abcdef123456)
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
```

## Cómo abrir el proyecto


### Iniciar Docker

Abre la terminal en la raiz del proyecto y escribe "docker compose up --build" para iniciar tanto backend como frontend. Si la imagen no está creada, se creará una nueva, este proceso puede tardar un rato


### Cómo detener el Docker:

Para finalizar el docker, pulsa "Ctrl + C" para cerrarlo. Para eliminar los contenedores, puedes usar "docker compose down"
