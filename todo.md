## Registro/auth de nuestro proyecto

- Entrar a el formulario de registro donde ingresara sus datos:
    - Nombre
    - Email
    - Contraseña

- El frontend enviara este formulario (fetch) a nuestro servidor (Endpoint: /api/auth/register)

- El backend validara los datos y si todo esta bien enviara al email registrado un mail de verificacion
    - 1. Validar los datos que vienen del formulario
    - 2. Validar que ese email no exista en mi DB
    - 3. Crear un token de validacion firmado con una clave-secreta desde nuestro backend y se lo enviaremos al mail del usuario (Aun falta definir)
    - 4. Encriptar/hashear la contrasña y se guardara en la DB (Database)
    - 5. Guardamos en la DB al usuario
    - 6. Respondo al frontend
























