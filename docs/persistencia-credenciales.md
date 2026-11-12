% ============================================================
%  5. PERSISTENCIA Y MANEJO DE CREDENCIALES
% ============================================================
\\section{Persistencia y manejo de credenciales}

\\subsection{Modelo de datos}

La persistencia utiliza MongoDB a través de Mongoose, implementando un enfoque mixto: las necesidades se \\textbf{embeben} como subdocumentos dentro de la publicación para optimizar la lectura del feed y el detalle, mientras que las demás entidades son colecciones independientes \\textbf{referenciadas} mediante \\code{ObjectId}. 

Mongoose gestiona las colecciones siguiendo la convención de nombres en minúsculas y plural: \\code{users}, \\code{publications}, \\code{reservations} y \\code{notifications}.

\\begin{figure}[htbp]
\\centering
\\resizebox{0.94\\linewidth}{!}{%
\\begin{tikzpicture}[
  ent/.style={rectangle split,rectangle split parts=2,draw=umdark,line width=0.9pt,rounded corners=3pt,
    fill=white,text width=5.2cm,font=\\footnotesize,inner sep=5pt,
    rectangle split part fill={umgreen,umgreen!6},drop shadow={shadow xshift=1pt,shadow yshift=-1pt,opacity=0.2}},
  rel/.style={thick,umdark},
  card/.style={font=\\scriptsize\\bfseries,text=robinorange,fill=white,inner sep=1pt}]
  \\node[ent] (u) at (0,0) {\\textcolor{white}{\\bfseries Usuario}\\nodepart{second}\\raggedright
    \\_id\\en space name, surname, nick\\en space email, password (hash)\\en space role, address, phone, verified\\en space saved\_publications[ ]};
  \\node[ent] (p) at (8.2,0) {\\textcolor{white}{\\bfseries Publicación}\\nodepart{second}\\raggedright
    \\_id, user\_id\\en space text, file, status, created\_at\\en space
    \\textcolor{umdark}{\\bfseries necesidades[ ] embebidas}\\en space name, status};
  \\node[ent] (n) at (0,-5.0) {\\textcolor{white}{\\bfseries Notificación}\\nodepart{second}\\raggedright
    \\_id, user\_id\\en space type, message, read, created\_at};
  \\node[ent] (r) at (8.2,-5.0) {\\textcolor{white}{\\bfseries Reserva}\\nodepart{second}\\raggedright
    \\_id\\en space publication\_id, item\_id, donor\_id\\en space status, reserved\_at, delivered\_at};
  \\draw[rel] (u.east) -- node[above,font=\\scriptsize]{crea} (p.west);
  \\node[card] at ($(u.east)+(0.3,0.25)$) {1};
  \\node[card] at ($(p.west)+(-0.3,0.25)$) {N};
  \\draw[rel] (u.south) -- node[right,font=\\scriptsize]{recibe} (n.north);
  \\node[card] at ($(u.south)+(-0.2,-0.3)$) {1};
  \\node[card] at ($(n.north)+(-0.2,0.3)$) {N};
  \\draw[rel] (p.south) -- node[right,font=\\scriptsize]{origina} (r.north);
  \\node[card] at ($(p.south)+(-0.2,-0.3)$) {1};
  \\node[card] at ($(r.north)+(-0.2,0.3)$) {N};
  \\draw[rel,dashed] (u.south east) -- node[above,sloped,font=\\scriptsize]{dona} (r.north west);
\\end{tikzpicture}}
\\caption{Modelo de datos de Robin: las necesidades se embeben en la publicación; las demás entidades se referencian por ObjectId.}
\\end{figure}

\\begin{center}
\\small
\\begin{tabularx}{0.96\\linewidth}{@{}>{\\raggedright\\arraybackslash}p{3.0cm}>{\\centering\\arraybackslash}p{2.0cm}>{\\raggedright\\arraybackslash}p{6.1cm}X@{}}
\\toprule
\\textbf{Relación} & \\textbf{Cardinalidad} & \\textbf{Implementación} & \\textbf{}\\.\\midrule
users $\rightarrow$ publications & 1:N & \\code{publications.user\_id} &\\
publications $\rightarrow$ necesidades & 1:N & Subdocumentos embebidos &\\
users $\rightarrow$ reservations & 1:N & \\code{reservations.donor\_id} &\\
necesidades $\rightarrow$ reservations & 1:0..1 activa & \\code{publication\_id} e \\code{item\_id} &\\
users $\rightarrow$ notifications & 1:N & \\code{notifications.user\_id} &\\
users $\rightarrow$ publications (guardados) & N:N & \\code{users.saved\_publications[ ]} &\\
\\bottomrule
\\end{tabularx}
\\end{center}

\\textbf{Campos, tipos y restricciones}

\\begin{lstlisting}[language=Java]
// users
{ _id: ObjectId, name: String, surname: String, nick: String (unique), 
  email: String (unique), password: String (hash), 
  role: String (beneficiario | donante | admin), 
  image: String, address: String, phone: String, verified: Boolean,
  created_at: Date,
  saved_publications: [ObjectId] } // referencias a Publication (Guardados)

// publications
{ _id: ObjectId, user_id: ObjectId, text: String, file: String,
  status: String (pendiente | aprobada | rechazada), 
  created_at: Date,
  necesidades: [{ _id: ObjectId, name: String, 
    status: String (disponible | reservado | entregado) }] }

// reservations
{ _id: ObjectId, publication_id: ObjectId, item_id: ObjectId, 
  donor_id: ObjectId, status: String (reservado | entregado | cancelada), 
  reserved_at: Date, delivered_at: Date }

// notifications
{ _id: ObjectId, user_id: ObjectId, type: String (confirmación | alerta pendiente | conflicto), 
  message: String, read: Boolean, created_at: Date }
\end{lstlisting}

\\textbf{Decisiones de diseño físico}
\\begin{itemize}[leftmargin=1.5em]
\\item \\textbf{Necesidades embebidas:} Permite recuperar la publicación y todos sus ítems en una sola operación de lectura, optimizando el feed y el detalle.
\\item \\textbf{Reservations referenciadas:} Tienen un ciclo de vida independiente (cancelación, entrega) y requieren consultas eficientes por donante.
\\item \\textbf{Notifications referenciadas:} Debido a que el volumen de notificaciones crece linealmente, se referencian para evitar alcanzar el límite de 16 MB de BSON por documento de usuario.
\\item \\textbf{Users referenciados:} Garantiza la integridad de los datos personales y evita la duplicidad de información en múltiples publicaciones o reservas.
\\end{itemize}

\\textbf{Índices}

\\begin{center}
\\small
\\begin{tabularx}{0.96\\linewidth}{@{}>{\\raggedright\\arraybackslash}p{2.5cm}>{\\raggedright\\arraybackslash}p{4.4cm}X@{}}
\\toprule
\\textbf{Colección} & \\textbf{Índice} & \\textbf{Propósito}\\.\\midrule
users & email único, nick único & Garantizar la unicidad de identidad.\\
publications, reservations, notifications & solo \\code{\\_id} (por defecto) & Sin índices compuestos declarados en el esquema; las consultas por \\code{status}, \\code{donor\_id} o \\code{user\_id} se resuelven sin índice de soporte.\\
\\bottomrule
\\end{tabularx}
\\end{center}
\\pendiente{No hay índices compuestos para el feed por \\code{status}, para reservas por \\code{donor\_id}+\\code{status} ni para notificaciones por \\code{user\_id}+\\code{read}, aunque esos son los patrones de consulta reales en los repositories. Con el volumen de datos de este proyecto no afecta el rendimiento observable, pero es deuda técnica declarada.}

\\subsection{Scripts y credenciales}

El despliegue y arranque del sistema se gestionan mediante scripts de Node.js definidos en el \code{package.json}. Para el desarrollo, se utiliza el comando \code{npm run dev}, que levanta el servidor en modo observador (watch mode), permitiendo que los cambios en el código se apliquen en tiempo real sin reiniciar el proceso manualmente.

La arquitectura de persistencia se divide en dos componentes con responsabilidades distintas:

\begin{enumerate}
    \item \textbf{Gestión de Conexión (\ruta{src/database/connection.ts}):} Es la infraestructura que mantiene el enlace activo entre la aplicación y MongoDB. Se ejecuta en cada arranque del servidor, leyendo la \code{MONGODB\_URI} del archivo de entorno para establecer la comunicación persistente.
    \item \textbf{Inicialización de Base de Datos (\ruta{db/init.ts}):} Es un script que se ejecuta manualmente (vía \code{npm run db:init}) para preparar la base de datos desde cero (es destructivo a propósito: vacía las colecciones antes de recrearlas). Sus funciones principales son:
    \begin{itemize}
        \item Vaciar las cuatro colecciones (\code{users}, \code{publications}, \code{reservations}, \code{notifications}).
        \item Sincronizar los índices definidos en los modelos (ej. unicidad de email y nick) con \code{syncIndexes()}.
        \item Crear el usuario administrador inicial. El rol \code{admin} no se puede crear por registro público.
        \item Crear datos de prueba: un \code{beneficiario}, un \code{donante} y una publicación de ese beneficiario ya \code{aprobada} con dos necesidades \code{disponible}, para poder probar el flujo de reserva sin registrarse a mano.
    \end{itemize}
\end{enumerate}

A continuación se muestra el flujo de arranque recomendado y la configuración de entorno necesaria para desplegar el servicio:

\\begin{lstlisting}[language={}]
# 1. Preparacion del entorno
cp .env.example .env       # Crear archivo de entorno local
npm install                 # Instalar dependencias del proyecto

# 2. Preparacion de la base de datos (destructivo: vacia y recrea)
npm run db:init             # Limpia, sincroniza indices y crea admin + datos de prueba

# 3. Ejecucion del servicio
npm run dev                 # Arranca servidor en modo desarrollo (watch)
\\end{lstlisting}

\\begin{lstlisting}[language={}]
# .env.example (Valores de ejemplo)
PORT=3900
MONGODB_URI=mongodb://localhost:27017/robin_db
JWT_SECRET=clave-secreta-aleatoria-larga
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/publications
\\end{lstlisting}

\\begin{lstlisting}[language={}]
# .gitignore
node_modules/
dist/
.env
.env.local
uploads/*
!uploads/.gitkeep
\\end{lstlisting}

\\textbf{Prácticas de seguridad adoptadas}
\\begin{enumerate}[leftmargin=1.5em]
\\item \\textbf{Exclusión de secretos:} El archivo \\code{.env} real nunca se versiona, proporcionando solo la plantilla \\code{.env.example}.
\\item \\textbf{Falla temprana:} El sistema valida la existencia de las variables de entorno críticas al arrancar el servidor.
\\item \\textbf{Mínimo privilegio:} Se utiliza una URI de conexión restringida al entorno de la base de datos.
\\item \\textbf{Secretos robustos:} El \\code{JWT\_SECRET} se define como una cadena larga y aleatoria para prevenir ataques de fuerza bruta.
\\item \\textbf{Rotación de credenciales:} En caso de exposición, se invalida la clave y se se limpia el historial de Git para eliminar cualquier rastro del secreto.
\\item \\textbf{CORS acotado por configuración:} el middleware \\code{cors} lee el origen permitido desde \\code{CORS\_ORIGIN} en vez de aceptar cualquier origen por defecto.
\\end{enumerate}
