# MusicSpace


## SETUP


### Paso 1: Instalar Docker Desktop

Entra en <https://www.docker.com/products/docker-desktop/> y descarga la última
versión de `Docker Desktop`.


### Paso 2: Preparar variables de entorno

Crea un archivo `.env` en la raíz del proyecto y escribe lo siguiente:

```sh
SECRET_KEY=(secret key, por ejempplo: django-insecure-abcdef123456)
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
```


## Abrir el proyecto


### Iniciar Docker

Abre la terminal en la raíz del proyecto y escribe para iniciar tanto backend
como frontend:

```sh
docker compose up --build
```

Si la imagen no está creada, se creará una nueva, este proceso puede tardar un
rato.


### Detener el Docker

Para finalizar el docker, pulsa `Ctrl + C` para cerrarlo. Para eliminar los
contenedores, puedes usar:

```sh
docker compose down
```
