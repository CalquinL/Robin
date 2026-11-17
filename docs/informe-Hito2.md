%% =====================================================================
%%  Robin — Hito 2: Diseño técnico del backend
%%  Universidad Mayor · INGT1003-001 · Arquitectura de Desarrollo Móvil y Web
%%  Autores: Lucas Calquín, Nicolás Escobar · Docente: Carlos Muñoz
%%
%%  Compilar con pdfLaTeX (2 pasadas, para índice y fondos TikZ).
%%  Archivos necesarios en la misma carpeta (o en ./img/):
%%      portada_robin.png   logo_umayor.png
%% =====================================================================
\documentclass[11pt,letterpaper]{article}

% ---------------------------------------------------------------- Codificación e idioma
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\IfFileExists{spanish.ldf}{%
  \usepackage[spanish,es-noshorthands]{babel}%
}{%
  % Respaldo si babel-spanish no está instalado: sin silabeo (evita cortes erróneos)
  \hyphenpenalty=10000 \exhyphenpenalty=10000
}
\DeclareUnicodeCharacter{2192}{\ensuremath{\rightarrow}}
\DeclareUnicodeCharacter{2014}{---}

% ---------------------------------------------------------------- Tipografía (equivalente a Arial)
\usepackage{helvet}
\renewcommand{\familydefault}{\sfdefault}
\usepackage{courier}
\usepackage{microtype}
\usepackage{setspace}
\linespread{1.18}\selectfont
\setlength{\parindent}{0pt}
\setlength{\parskip}{6pt plus 1pt}
\emergencystretch=3em

% ---------------------------------------------------------------- Página
\usepackage[letterpaper,left=1.2in,right=1.2in,top=1.55in,bottom=1.1in,
            headheight=18pt,headsep=0.2in,footskip=0.42in]{geometry}

% ---------------------------------------------------------------- Colores corporativos (muestreados del PDF original)
\usepackage[table,dvipsnames]{xcolor}
\definecolor{mayorgreen}{RGB}{56,118,29}     % verde de títulos y pestaña
\definecolor{mayordark}{RGB}{39,78,19}
\definecolor{robingreen}{RGB}{71,110,73}     % verde del logotipo Robin
\definecolor{robinorange}{RGB}{221,110,17}   % naranja de la “R” de Robin
\definecolor{cream}{RGB}{245,244,237}
\definecolor{softgreen}{RGB}{234,242,228}
\definecolor{lightgreen}{RGB}{183,206,174}
\definecolor{codebg}{RGB}{13,17,23}
\definecolor{codefg}{RGB}{201,209,217}
\definecolor{jsgreen}{RGB}{138,214,120}
\definecolor{jsblue}{RGB}{121,192,255}
\definecolor{jsred}{RGB}{255,123,114}
\definecolor{kwpurple}{RGB}{210,168,255}
\definecolor{commentgray}{RGB}{125,140,150}
\definecolor{treegray}{RGB}{110,125,140}
\definecolor{dangerred}{RGB}{176,38,30}
% Colores por capa de la arquitectura
\definecolor{lyroutes}{RGB}{56,118,29}
\definecolor{lymiddle}{RGB}{71,110,73}
\definecolor{lycontrol}{RGB}{101,153,66}
\definecolor{lyservice}{RGB}{221,110,17}
\definecolor{lyrepo}{RGB}{31,98,112}
\definecolor{lymodel}{RGB}{23,64,82}
\definecolor{lydb}{RGB}{28,45,36}
% Colores por verbo HTTP
\definecolor{vGET}{RGB}{47,109,181}
\definecolor{vPOST}{RGB}{56,118,29}
\definecolor{vPATCH}{RGB}{221,110,17}
\definecolor{vPUT}{RGB}{123,79,163}
\definecolor{vDELETE}{RGB}{176,38,30}

% ---------------------------------------------------------------- Gráficos, tablas, código
\usepackage{graphicx}
\graphicspath{{./}{img/}}
\usepackage{tikz}
\usetikzlibrary{shadows,calc,arrows.meta,positioning,shapes.geometric,shapes.multipart,fit,backgrounds,decorations.pathreplacing}
\usepackage{pgfplots}
\pgfplotsset{compat=1.16}
\usepackage[skins,breakable,listings,raster]{tcolorbox}
\usepackage{array,tabularx,longtable,booktabs,multirow}
\usepackage{enumitem}
\usepackage{float}
\usepackage{needspace}
\usepackage{caption}
\usepackage{pifont}
\usepackage{fancyhdr}
\usepackage{lastpage}
\usepackage{eso-pic}
\usepackage{titlesec}
\usepackage[titles]{tocloft}

% ---------------------------------------------------------------- Nombres en español
\makeatletter
\newcommand{\robinnames}{%
  \renewcommand{\contentsname}{Tabla de contenidos}%
  \renewcommand{\listfigurename}{Índice de figuras}%
  \renewcommand{\listtablename}{Índice de tablas}%
  \renewcommand{\figurename}{Figura}%
  \renewcommand{\tablename}{Tabla}%
}
\@ifundefined{captionsspanish}{}{\addto\captionsspanish{\robinnames}}
\AtBeginDocument{\robinnames}
\makeatother

% ---------------------------------------------------------------- Decoración de títulos
\newcommand{\titledecor}{%
  \par\nobreak\vspace{2pt}\noindent
  \begin{tikzpicture}[baseline=0pt]
    \fill[mayorgreen] (0,0) rectangle (\linewidth,1.2pt);
    \fill[robinorange] (0,-0.6pt) rectangle (2.6cm,2.2pt);
  \end{tikzpicture}\par\nobreak}

\newcommand{\sectionbadge}[1]{%
  \tikz[baseline=(b.base)]\node[fill=robinorange,text=white,rounded corners=4pt,
    minimum width=1.05cm,minimum height=1.05cm,inner sep=0pt,
    font=\sffamily\bfseries\fontsize{20}{22}\selectfont] (b) {#1};}

\titleformat{\section}[block]
  {\normalfont\sffamily\bfseries\fontsize{24}{28}\selectfont\color{mayorgreen}}
  {\sectionbadge{\thesection}}{0.6em}{}
  [\titledecor]
\titlespacing*{\section}{0pt}{0pt}{10pt}
\newcommand{\sectionbreak}{\clearpage}

\titleformat{\subsection}[block]
  {\normalfont\sffamily\bfseries\fontsize{14}{17}\selectfont\color{mayorgreen}}
  {\textcolor{robinorange}{\rule[-0.25ex]{4pt}{1.15em}}\hspace{7pt}\thesubsection.}{0.45em}{}
\titlespacing*{\subsection}{0pt}{16pt}{7pt}

\titleformat{\subsubsection}[block]
  {\normalfont\sffamily\bfseries\fontsize{12}{15}\selectfont\color{robingreen}}
  {\textcolor{robinorange}{\rule[0.1ex]{3pt}{0.7em}}\hspace{6pt}\thesubsubsection.}{0.4em}{}
\titlespacing*{\subsubsection}{0pt}{12pt}{5pt}

% ---------------------------------------------------------------- Listas
\setlist[itemize]{label=\textcolor{robinorange}{\large$\bullet$},leftmargin=1.7em,itemsep=3pt,topsep=3pt}
\setlist[enumerate]{label=\textcolor{mayorgreen}{\bfseries\arabic*.},leftmargin=2.1em,itemsep=4pt,topsep=3pt}

% ---------------------------------------------------------------- Pies de página y notas al pie
\renewcommand{\thefootnote}{\textcolor{robinorange}{\bfseries\arabic{footnote}}}
\renewcommand{\footnoterule}{\kern-3pt{\color{robinorange}\hrule width 2.4cm height 1pt}\kern 3pt}

\pagestyle{fancy}
\fancyhf{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0.4pt}
\renewcommand{\footrule}{%
  {\color{mayorgreen}\hrule width\headwidth height 0.9pt}\vskip 1.4pt
  {\color{robinorange}\hrule width 2.8cm height 1.8pt}}
\fancyfoot[L]{\footnotesize\color{robingreen}\textbf{Robin} \textcolor{robinorange}{\rule[0.02ex]{0.5em}{0.5em}} Hito 2}
\fancyfoot[R]{\footnotesize\color{robingreen}Página \textbf{\thepage} de \textbf{\pageref{LastPage}}}

% Encabezado: logo a la izquierda y pestaña verde con el número de página (como el original)
\fancyhead[L]{%
  \begin{tikzpicture}[remember picture,overlay]
    \node[anchor=north west,inner sep=0pt] at ($(current page.north west)+(0.62in,-0.16in)$)
      {\includegraphics[width=1.58in,height=0.78in,keepaspectratio]{logo_umayor.png}};
    \fill[mayorgreen,draw=mayordark,line width=0.6pt]
      ($(current page.north east)+(-1.5in,-0.48in)$) --
      ($(current page.north east)+(0,-0.48in)$) --
      ($(current page.north east)+(0,-1.24in)$) --
      ($(current page.north east)+(-1.38in,-1.24in)$) --
      ($(current page.north east)+(-1.5in,-1.12in)$) -- cycle;
    \node[text=white,font=\sffamily\bfseries\large] at ($(current page.north east)+(-0.72in,-0.86in)$) {\thepage};
  \end{tikzpicture}}

% ---------------------------------------------------------------- Subtítulos de tablas y figuras
\captionsetup{labelfont={bf,color=mayorgreen},labelsep=period,font=small,
  justification=raggedright,singlelinecheck=off,skip=6pt}

% ---------------------------------------------------------------- Índices (tocloft)
\setcounter{tocdepth}{2}
\renewcommand{\cfttoctitlefont}{\sffamily\bfseries\fontsize{24}{28}\selectfont\color{mayorgreen}}
\renewcommand{\cftlottitlefont}{\sffamily\bfseries\fontsize{20}{24}\selectfont\color{mayorgreen}}
\renewcommand{\cftloftitlefont}{\sffamily\bfseries\fontsize{20}{24}\selectfont\color{mayorgreen}}
\renewcommand{\cftaftertoctitle}{\titledecor}
\renewcommand{\cftafterlottitle}{\titledecor}
\renewcommand{\cftafterloftitle}{\titledecor}
\setlength{\cftbeforetoctitleskip}{0pt}\setlength{\cftaftertoctitleskip}{20pt}
\setlength{\cftbeforelottitleskip}{14pt}\setlength{\cftafterlottitleskip}{10pt}
\setlength{\cftbeforeloftitleskip}{0pt}\setlength{\cftafterloftitleskip}{10pt}
\renewcommand{\cftdotsep}{2}
\renewcommand{\cftsecfont}{\sffamily\bfseries\large\color{mayorgreen}}
\renewcommand{\cftsecpagefont}{\sffamily\bfseries\large\color{mayorgreen}}
\renewcommand{\cftsecpresnum}{\color{robinorange}}
\renewcommand{\cftsecaftersnum}{\hspace{0pt}}
\renewcommand{\cftsecleader}{\color{robinorange}\cftdotfill{\cftdotsep}}
\setlength{\cftbeforesecskip}{10pt}
\setlength{\cftsecindent}{0pt}\setlength{\cftsecnumwidth}{2em}
\renewcommand{\cftsubsecfont}{\sffamily\normalsize\color{black!80}}
\renewcommand{\cftsubsecpagefont}{\sffamily\normalsize\bfseries\color{robingreen}}
\renewcommand{\cftsubsecpresnum}{\color{robingreen}}
\renewcommand{\cftsubsecleader}{\color{lightgreen}\cftdotfill{\cftdotsep}}
\setlength{\cftbeforesubsecskip}{3pt}
\setlength{\cftsubsecindent}{2em}\setlength{\cftsubsecnumwidth}{2.6em}
\renewcommand{\cftfigfont}{\sffamily\small}
\renewcommand{\cfttabfont}{\sffamily\small}
\renewcommand{\cftfigpagefont}{\sffamily\small\bfseries\color{robingreen}}
\renewcommand{\cfttabpagefont}{\sffamily\small\bfseries\color{robingreen}}
\renewcommand{\cftfigpresnum}{\color{robinorange}\bfseries Figura~}
\renewcommand{\cfttabpresnum}{\color{robinorange}\bfseries Tabla~}
\renewcommand{\cftfigaftersnum}{.}
\renewcommand{\cfttabaftersnum}{.}
\setlength{\cftfignumwidth}{4.6em}\setlength{\cfttabnumwidth}{4.2em}
\renewcommand{\cftfigleader}{\color{lightgreen}\cftdotfill{\cftdotsep}}
\renewcommand{\cfttableader}{\color{lightgreen}\cftdotfill{\cftdotsep}}
\setlength{\cftbeforefigskip}{3pt}\setlength{\cftbeforetabskip}{3pt}

% ---------------------------------------------------------------- Hipervínculos (cargar al final)
\usepackage[bookmarks=true,bookmarksnumbered=true,colorlinks=true,linkcolor=mayorgreen,
  urlcolor=robinorange,citecolor=mayorgreen,plainpages=false,pdfencoding=auto,psdextra]{hyperref}
\hypersetup{pdftitle={Robin — Hito 2: diseño técnico del backend},
  pdfauthor={Lucas Calquín; Nicolás Escobar},
  pdfsubject={INGT1003-001 Arquitectura de Desarrollo Móvil y Web, Universidad Mayor}}

% ---------------------------------------------------------------- Macros del documento
\newcommand{\code}[1]{\texttt{\detokenize{#1}}}
\newcommand{\vchip}[2]{\tcbox[on line,colback=#1,colframe=#1,boxrule=0pt,arc=2.5pt,
  left=3pt,right=3pt,top=1.5pt,bottom=1.5pt]{\sffamily\bfseries\scriptsize\color{white}#2}}
\newcommand{\GET}{\vchip{vGET}{GET}}
\newcommand{\POST}{\vchip{vPOST}{POST}}
\newcommand{\PATCH}{\vchip{vPATCH}{PATCH}}
\newcommand{\PUT}{\vchip{vPUT}{PUT}}
\newcommand{\DELETE}{\vchip{vDELETE}{DELETE}}
\newcommand{\hc}[1]{\textcolor{white}{\sffamily\bfseries #1}}
\newcommand{\route}[2]{{\ttfamily\fontsize{7.2}{9}\selectfont\detokenize{#1}}\newline{\scriptsize\itshape\color{black!65}#2}}
\newcommand{\ok}[1]{\textcolor{mayorgreen}{\bfseries #1}}
\newcommand{\errs}[1]{\textcolor{dangerred}{\small #1}}
\newcommand{\lyr}[1]{\textcolor{#1}{\rule[-0.05ex]{0.55em}{0.55em}}}

\newcommand{\pendiente}[1]{%
  \begin{tcolorbox}[enhanced,breakable,colback=robinorange!6,colframe=robinorange!70,boxrule=0.5pt,
    arc=2pt,borderline west={3.5pt}{0pt}{robinorange},left=10pt,top=5pt,bottom=5pt,
    fontupper=\small\itshape\color{black!70}]
    \textcolor{robinorange}{\bfseries Por completar.} #1
  \end{tcolorbox}}

\newtcolorbox{callout}[1][]{enhanced,breakable,colback=softgreen,colframe=mayorgreen,boxrule=0.5pt,
  arc=3pt,borderline west={4pt}{0pt}{robinorange},left=10pt,right=8pt,top=6pt,bottom=6pt,#1}

\tcbset{kpi/.style={enhanced,colback=white,colframe=lightgreen,boxrule=0.8pt,arc=4pt,
  halign=center,valign=center,top=5pt,bottom=5pt,left=2pt,right=2pt,
  borderline south={3pt}{0pt}{robinorange},shadow={0.6mm}{-0.6mm}{0mm}{black!12}}}
\newcommand{\kpi}[2]{\begin{tcolorbox}[kpi]{\fontsize{26}{28}\selectfont\bfseries\color{robinorange}#1}\\[-1pt]{\footnotesize\color{robingreen}\bfseries #2}\end{tcolorbox}}

% Tablas con encabezado verde y filas alternadas
\renewcommand{\arraystretch}{1.35}
\setlength{\tabcolsep}{4pt}
\arrayrulecolor{lightgreen}
\newcommand{\tablestyle}{\rowcolors{2}{white}{softgreen}\arrayrulecolor{lightgreen}\small}

% ---------------------------------------------------------------- Listados de código
\lstdefinestyle{robincode}{
  basicstyle=\ttfamily\fontsize{8.2}{10}\selectfont,
  columns=fullflexible,keepspaces=true,showstringspaces=false,
  breaklines=true,breakindent=1.2em,postbreak=\mbox{\textcolor{robinorange}{$\hookrightarrow$}\space},
  extendedchars=true,inputencoding=utf8,
  literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1
           {Á}{{\'A}}1 {É}{{\'E}}1 {Í}{{\'I}}1 {Ó}{{\'O}}1 {Ú}{{\'U}}1 {Ñ}{{\~N}}1
           {→}{{$\rightarrow$}}1 {·}{{$\cdot$}}1 {—}{{---}}1,
  escapeinside={(*@}{@*)}}
\lstdefinelanguage{ts}{
  keywords={async,await,try,catch,const,let,return,if,throw,new,function,class,import,export,from,this,Promise},
  keywordstyle=\color{kwpurple}\bfseries,
  morecomment=[l]{//},commentstyle=\color{commentgray}\itshape,
  morestring=[b]",morestring=[b]',stringstyle=\color{jsgreen},sensitive=true}
\lstdefinelanguage{json}{
  morestring=[b]",stringstyle=\color{jsgreen}}
\lstdefinelanguage{tree}{
  morecomment=[l]{\#},commentstyle=\color{commentgray}\itshape,
  literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1
           {Á}{{\'A}}1 {É}{{\'E}}1 {Í}{{\'I}}1 {Ó}{{\'O}}1 {Ú}{{\'U}}1 {Ñ}{{\~N}}1
           {→}{{$\rightarrow$}}1
           {├}{{\textcolor{treegray}{+}}}1 {└}{{\textcolor{treegray}{+}}}1
           {─}{{\textcolor{treegray}{-}}}1 {│}{{\textcolor{treegray}{|}}}1}

\newtcblisting{codebox}[3][]{enhanced,breakable,listing only,
  colback=codebg,colframe=#2,colbacktitle=#2,coltitle=white,coltext=codefg,
  fonttitle=\sffamily\bfseries\footnotesize,title={#3},boxrule=0.6pt,arc=3pt,
  left=7pt,right=7pt,top=5pt,bottom=5pt,boxsep=1pt,
  listing options={style=robincode,#1}}

% ---------------------------------------------------------------- Estilos TikZ reutilizables
\tikzset{
  arr/.style={-{Stealth[length=2.2mm,width=1.8mm]},thick,color=black!55},
  arrg/.style={-{Stealth[length=2.2mm,width=1.8mm]},thick,color=robingreen},
  layer/.style={rounded corners=4pt,minimum width=7cm,minimum height=1.08cm,text=white,
    font=\sffamily\small,align=center,inner sep=3pt,drop shadow={opacity=.22}},
  state/.style={rounded corners=8pt,minimum width=3.1cm,minimum height=1.25cm,text=white,
    font=\sffamily\bfseries,align=center,drop shadow={opacity=.22}},
  flow/.style={rounded corners=3pt,minimum width=1.85cm,minimum height=1.25cm,text=white,
    font=\sffamily\scriptsize\bfseries,align=center,inner sep=2pt,drop shadow={opacity=.2}},
  errchip/.style={rounded corners=2pt,fill=dangerred,text=white,font=\sffamily\bfseries\tiny,
    inner sep=2pt,minimum width=0.9cm},
}

\newcommand{\ruta}[1]{\texttt{\detokenize{#1}}}
\newcommand{\porcompletar}[1]{\textcolor{robinorange}{\textit{[Por completar: #1]}}}

\begin{document}

% ------------------------------------------------------------------ PORTADA
\pagenumbering{roman}
\begin{titlepage}
\thispagestyle{empty}
\begin{tikzpicture}[remember picture,overlay]
  \node[inner sep=0pt] at (current page.center)
    {\includegraphics[width=\paperwidth,height=\paperheight]{portada.jpg}};
  \node[anchor=south east,align=right,fill=cream,fill opacity=0.82,text opacity=1,
        draw=robingreen,line width=0.8pt,rounded corners=5pt,inner xsep=12pt,inner ysep=9pt,
        font=\sffamily\small,text width=4.1cm]
    at ($(current page.south east)+(-0.9in,1.25in)$)
    {\textbf{Nombre:}\\Lucas Calquín\\Nicolás Escobar\\[7pt]
     \textbf{Docente:}\\Carlos Muñoz\\[7pt]
     \textbf{Sección:}\\INGT1003-001};
\end{tikzpicture}
\end{titlepage}
\clearpage
\pagenumbering{arabic}

% ------------------------------------------------------------------ ÍNDICES
\tableofcontents
\clearpage
{\let\clearpage\relax\let\newpage\relax\let\cleardoublepage\relax
\listoffigures
\vspace{8pt}
\listoftables}
\clearpage

% ------------------------------------------------------------------ 1. INTRODUCCIÓN
\section{Introducción}

Este documento describe el diseño técnico del backend del proyecto \textbf{“Robin”}, una plataforma web de wishlist solidaria. En ella, personas naturales publican sus necesidades concretas y reciben ayuda en bienes no monetarios de donantes, con verificación previa de cada historia mediante un rol de moderador y confirmación de la entrega.

Este avance corresponde al \textbf{Hito 2} del proyecto semestral de Arquitectura de Desarrollo Móvil y Web y continúa la propuesta del Hito 1, donde se definieron el problema, la propuesta de valor, el stack tecnológico, la arquitectura de información y el modelado de datos.

El objetivo de este Hito es la construcción y documentación del lado del servidor: una API REST con persistencia real de datos, organizada en capas con responsabilidades separadas, con credenciales fuera del repositorio y con decisiones de arquitectura justificadas. El alcance se limita al back end; el frontend en React (React, s.f.) se integra en el Hito 3.

\vspace{10pt}
\begin{tcbraster}[raster columns=4,raster equal height,raster column skip=7pt]
  \kpi{25}{endpoints REST}
  \kpi{3}{roles de usuario}
  \kpi{5}{entidades de datos}
  \kpi{6}{capas del backend}
\end{tcbraster}

% ------------------------------------------------------------------ 2. TRAZABILIDAD
\section{Trazabilidad con el Hito 1}

\subsection{Definición del Hito 1}
El Hito 1 estableció las bases conceptuales y técnicas sobre las que se construye el backend del proyecto. Los elementos que condicionan directamente el trabajo del Hito 2 son los siguientes:

\begin{enumerate}
\item \textbf{Problema y propuesta de valor:} Se identificó que la ayuda solidaria está dominada por intermediarios institucionales y que las personas naturales no pueden gestionar sus propias solicitudes. En los casos cuando una persona natural puede lanzar su propia campaña de donación, estas se basan en donaciones monetarias, lo que puede exponer a los donantes a estafas mediante la realización de campañas falsas. Robin propone una wishlist de bienes, donde la unidad de valor es el ítem a donar y no el dinero, con un ciclo de vida disponible $\rightarrow$ reservado $\rightarrow$ entregado, verificación previa de cada publicación por un moderador y confirmación fotográfica de cada entrega.
\item \textbf{Stack y lenguaje}: Se definió el stack MERN (MongoDB, s.f.-d; Express, s.f.-b; React, s.f.; Node.js, s.f.) y se eligió TypeScript como lenguaje principal, aceptando una curva de aprendizaje adicional a cambio de detección temprana de errores y tipado compartido entre capas (Microsoft, s.f.).
\item \textbf{Arquitectura}: Se propuso una arquitectura cliente-servidor de tres capas. El servidor es una API REST en Node.js y Express (Express, s.f.-c; Express, s.f.-d) organizada internamente en routes, controllers, services y middlewares (autenticación JSON Web Token (Jones et al., 2015), validación de payloads y manejo centralizado de errores). La persistencia usa MongoDB a través de la librería Mongoose (Mongoose, s.f.-b).
\item \textbf{Arquitectura de información}: Se definieron tres roles (beneficiario, donante y moderador), el diagrama de navegación y un feed que muestra solo publicaciones, dejando las necesidades y la acción de reservar en el detalle de cada publicación.
\item \textbf{Modelo de datos}: El modelo lógico contempla cinco entidades: Usuario, Publicación, Necesidad, Reserva y Notificación. El modelo físico (JSON) adopta un enfoque mixto: las necesidades se embeben como subdocumentos de la publicación, y usuarios, reservas y notificaciones son colecciones independientes referenciadas (MongoDB, s.f.-c) mediante ObjectId.\footnote{Identificador único de 12 bytes que MongoDB asigna por defecto al campo \texttt{\_id} de cada documento. (MongoDB, s.f.-b)}
\item \textbf{Plan de trabajo:} La malla de actividades asignó al Hito 2 la definición de la interfaz de programación y el modelado de datos, la implementación de la autenticación y de los endpoints REST, la documentación técnica y el testeo de la API.
\end{enumerate}

\subsection{Sección de cambios}
Esta sección declara qué se conserva y qué se modifica respecto de la propuesta del Hito 1, junto con el motivo y el impacto de cada cambio.

\subsubsection{Elementos que se conservan}
\begin{itemize}
\item El concepto de wishlist de bienes y su ciclo de vida disponible $\rightarrow$ reservado $\rightarrow$ entregado.
\item Los tres roles de usuario y el flujo de moderación previa a la publicación (el rol conceptual de moderador del Hito 1 se implementa con el valor técnico \code{admin}, ver sección de cambios).
\item El stack Node.js, Express y MongoDB, con autenticación mediante JWT.\footnote{JSON Web Token: estándar abierto (RFC 7519) para transmitir información firmada entre cliente y servidor. (Jones et al., 2015)}
\item La separación entre routes, controllers, services y middlewares.
\item El modelo de datos de cinco entidades y el enfoque mixto de embebido y referenciado.
\item La decisión de que el feed exponga solo publicaciones de forma paginada y de que la reserva se realice desde el detalle.
\end{itemize}

\subsubsection{Elementos que se modifican}

{\tablestyle
\begin{longtable}{@{}>{\raggedright\arraybackslash}p{3.15cm}>{\raggedright\arraybackslash}p{5.55cm}>{\raggedright\arraybackslash}p{5.5cm}@{}}
\caption{Cambios respecto de la propuesta del Hito 1}\\
\rowcolor{mayorgreen}\hc{Qué cambia} & \hc{Motivo} & \hc{Impacto}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Qué cambia} & \hc{Motivo} & \hc{Impacto}\\
\endhead
\textbf{Se agrega la capa repositories} &
Aislar la lógica de acceso a datos de la lógica de negocio para evitar el acoplamiento con la base de datos &
Mayor mantenibilidad, facilidad para realizar pruebas unitarias y centralización de consultas críticas (reservas atómicas)\\
\textbf{Estado de la reserva:} se define el estado cancelada &
El prototipo permite cancelar una reserva, pero el Hito 1 no definía los estados de la reserva &
Al cancelar, el ítem vuelve al estado disponible y puede ser reservado por otro donante\\
\textbf{Contrato de la API:} rutas orientadas a recursos con versionado \code{/api/v1} &
El Hito 1 no definía nomenclatura de rutas ni criterio de versionado &
Contrato estable y documentado, que permite integrar el frontend en el Hito 3 sin rediseñar el servidor\\
\textbf{Confirmación fotográfica de entregas:} se cambia por confirmación manual, realizada por cualquiera de las dos partes (el donante o el beneficiario dueño de la publicación) &
La subida de fotos exige manejo de archivos y plantea un riesgo de privacidad. Esa complejidad excede el mínimo del hito y desvía el tiempo disponible del flujo central de estados (disponible $\rightarrow$ reservado $\rightarrow$ entregado) &
Se pierde evidencia verificable de la entrega, lo que debilita la garantía de trazabilidad. Se mitiga registrando qué reserva cambió de estado y la fecha en \code{delivered\_at}; no se exige la confirmación de ambas partes, basta con una.\\
\textbf{Plan de empresa y certificado de donación:} Se elimina del proyecto y el ingreso queda solo en la comisión de afiliado &
El certificado depende de una entidad donataria inscrita en el registro público de la Ley 21.440, cuya constitución y validación legal excede el alcance técnico del proyecto &
Disminución de los ingresos dentro de la plataforma, pero con un modelo de ingresos más realista, ya que la fundación intermediaria solo se estableció como idea.\\
\textbf{Rol moderador $\rightarrow$ \code{admin}} &
El valor del rol en el esquema y en el payload del JWT usa el nombre técnico \code{admin}; \code{moderador} queda solo como el nombre conceptual del rol en la propuesta de valor &
Ninguno a nivel de funcionalidad: la regla de negocio (solo este rol aprueba o rechaza publicaciones) es la misma; cambia únicamente la nomenclatura en el código, la API y este informe.\\
\textbf{Nuevos recursos de apoyo al frontend} (notificaciones, guardados, búsqueda) &
El Hito 1 ya consideraba notificaciones en el modelo de datos, pero no como un recurso de la API; guardados y búsqueda surgieron como necesidades concretas al construir las pantallas del Hito 3 &
Endpoints nuevos (\code{/notifications}, \code{/users/saved-publications}) y un parámetro de consulta opcional (\code{?search=} en \code{GET /publications}): cambios compatibles (versión menor, misma ruta \code{/api/v1}), no modifican ningún contrato existente\\
\end{longtable}}

\begin{figure}[H]
\centering
\begin{tikzpicture}
  \node[state,fill=mayorgreen,minimum width=2.7cm] (disp) at (0,0) {Disponible};
  \node[state,fill=robinorange,minimum width=2.7cm] (res) at (6.0,0) {Reservado};
  \node[state,fill=mayordark,minimum width=2.7cm] (ent) at (12.0,0) {Entregado};
  \draw[arr] (disp.east) -- node[above,font=\sffamily\scriptsize,align=center,yshift=1pt]{\textbf{reservar}\\\code{POST /reservations}} (res.west);
  \draw[arr] (res.east) -- node[above,font=\sffamily\scriptsize,align=center,yshift=1pt]{\textbf{confirmar entrega}\\\code{status: entregado}} (ent.west);
  \draw[arr,color=dangerred] (res.south) to[out=-110,in=-70,looseness=1.0] (disp.south);
  \node[font=\sffamily\scriptsize,align=center,text=dangerred,text width=5.2cm] at (3.0,-1.55) {\textbf{cancelar} (\code{status: cancelada})\\el ítem vuelve a estar disponible};
  \node[font=\sffamily\scriptsize,color=black!65,align=center,text width=4.2cm] at (12.0,-1.55) {confirma el donante o el beneficiario (cualquiera de los dos); se registra \code{delivered\_at}};
\end{tikzpicture}
\caption{Ciclo de vida de un ítem de la wishlist y transiciones de estado.}
\end{figure}

% ------------------------------------------------------------------ 3. DISEÑO API REST
\section{Diseño de API REST}

\subsection{Criterios de diseño}
La API REST (Fielding, 2000) de Robin se diseña bajo el principio \textit{contract-first}:\footnote{Enfoque en el que el contrato de la API se define y acuerda antes de escribir el código que lo implementa.} la tabla de recursos de este capítulo es el acuerdo entre el servidor y la futura interfaz del Hito 3, y el código se ajusta a ella.

\textbf{\color{mayorgreen}Criterios de diseño adoptados:}

\begin{enumerate}
\item Semántica estándar de los verbos HTTP (Fielding et al., 2022): \GET{} consulta sin efectos secundarios; \POST{} crea; \PATCH{} modifica parcialmente; \PUT{} reemplaza; \DELETE{} elimina.
\item Acciones de dominio modeladas como estado. En lugar de rutas como “/reserve”, se modifica el estado del recurso (\code{PATCH /publication/{id}/status}) o se crea un recurso nuevo (\code{POST /reservation}).
\item JSON como formato de entrada y salida, salvo la subida de imágenes.
\item API sin estado y autenticación por JWT en la cabecera \code{Authorization} (Jones \& Hardt, 2012). El middleware verifica el token y el rol (Express, s.f.-d). La verificación de propiedad del recurso (por ejemplo, que una publicación pertenezca al usuario) la hace la capa de servicios.
\item Paginación por parámetros de consulta y respuesta con metadatos de paginación.
\item El código de estado HTTP indica el resultado (Fielding et al., 2022). Se repite en el cuerpo con campos como \code{status: "success"}.
\item Respuestas sin datos sensibles (no se devuelven contraseñas) y errores sin detalles internos.
\item Reglas de negocio atómicas. La reserva de un ítem a donar se resuelve con una actualización condicionada al estado disponible, para evitar reservas duplicadas (MongoDB, s.f.-a).
\end{enumerate}

\subsection{Criterios de versionado}
\begin{itemize}
\item \textbf{Versión en la ruta:} Toda la API se expone bajo \code{/api/v1}. Se eligió porque es explícito, simple de probar con cualquier cliente y de documentar; se descartaron la cabecera personalizada y el parámetro de consulta por ser menos visibles.
\item \textbf{Esquema} \code{/v1} identifica la versión mayor del contrato, y el número de release sigue versionado semántico (MAJOR.MINOR.PATCH) (Preston-Werner, s.f.). La entrega de este hito corresponde a la release 1.0.0.
\item \textbf{Cambios compatibles:} nuevos endpoints, campos opcionales, nuevos valores aceptados se publican como versión menor (1.1.0) sin cambiar la ruta.
\item \textbf{Cambios incompatibles:} renombrar o eliminar un campo, cambiar un código de estado o la estructura de un error, requieren una nueva versión mayor (\code{/api/v2}).
\end{itemize}

\begin{figure}[H]
\centering
\begin{tikzpicture}
  \node[state,fill=mayorgreen,minimum width=3.2cm] (a) at (0,0) {1.0.0\\[-2pt]{\scriptsize\mdseries entrega de este hito}};
  \node[state,fill=robingreen,minimum width=3.2cm] (b) at (5.4,0) {1.1.0\\[-2pt]{\scriptsize\mdseries cambio compatible}};
  \node[state,fill=robinorange,minimum width=3.2cm] (c) at (11,0) {2.0.0\\[-2pt]{\scriptsize\mdseries cambio incompatible}};
  \draw[arr] (a) -- node[above,font=\sffamily\scriptsize]{versión menor} (b);
  \draw[arr] (b) -- node[above,font=\sffamily\scriptsize]{versión mayor} (c);
  \draw[decorate,decoration={brace,amplitude=5pt,mirror},thick,color=mayorgreen]
    (-1.7,-1.0) -- node[below=6pt,font=\sffamily\scriptsize\bfseries,color=mayorgreen]{\code{/api/v1}~(misma ruta)} (7.0,-1.0);
  \draw[decorate,decoration={brace,amplitude=5pt,mirror},thick,color=robinorange]
    (9.4,-1.0) -- node[below=6pt,font=\sffamily\scriptsize\bfseries,color=robinorange]{\code{/api/v2}} (12.6,-1.0);
\end{tikzpicture}
\caption{Esquema de versionado: ruta mayor y versionado semántico de la release.}
\end{figure}

\subsection{Tabla de recursos}
Todas las rutas parten de \code{/api/v1}. Acceso: Público, Autenticado, o el rol requerido (beneficiario, donante, administrador). Códigos de error comunes a todo endpoint autenticado: 401 (sin token, inválido o expirado) y 500; solo se listan los específicos.

\textbf{\color{mayorgreen}Usuarios}

{\tablestyle
\begin{longtable}{@{}>{\centering\arraybackslash}p{1.6cm}>{\raggedright\arraybackslash}p{4.15cm}>{\raggedright\arraybackslash}p{3.7cm}>{\raggedright\arraybackslash}p{1.45cm}>{\centering\arraybackslash}p{1.1cm}>{\centering\arraybackslash}p{1.4cm}@{}}
\caption{Recursos de usuarios}\\
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endhead
\POST & \route{/users/register}{registrar usuario} & \footnotesize name, surname, nick, email, password, role {\scriptsize(beneficiario o donante)} & Público & \ok{201} & \errs{400, 409}\\
\POST & \route{/users/login}{iniciar sesión} & \footnotesize email, password & Público & \ok{200} & \errs{400, 401}\\
\GET & \route{/users/profile/:id}{ver perfil de un usuario} & -- & JWT & \ok{200} & \errs{400, 404}\\
\GET & \route{/users/list}{listar usuarios} & \footnotesize Query: page, limit & JWT & \ok{200} & \errs{400}\\
\PATCH & \route{/users/update}{actualizar mi perfil} & \footnotesize name, surname, nick, address, phone (opcionales); current\_password + new\_password (opcionales, cambio de contraseña) & JWT & \ok{200} & \errs{400, 401, 404, 409}\\
\POST & \route{/users/upload}{subir avatar} & \footnotesize multipart/form-data (campo “file”); jpeg/png/webp, máx. 2MB & JWT & \ok{200} & \errs{400, 415}\\
\GET & \route{/users/avatar/:file}{obtener imagen de avatar} & -- & Público & \ok{200} & \errs{404}\\
\GET & \route{/users/saved-publications}{ver mis publicaciones guardadas} & \footnotesize Query: page, limit & JWT & \ok{200} & \errs{400}\\
\POST & \route{/users/saved-publications}{guardar una publicación} & \footnotesize publication\_id & JWT & \ok{201} & \errs{400, 404}\\
\DELETE & {\ttfamily\fontsize{7.2}{9}\selectfont/users/saved-publications/\newline :publicationId}\newline{\scriptsize\itshape\color{black!65}quitar una publicación guardada} & -- & JWT & \ok{204} & ---\\
\GET & \route{/users/:id/publications}{publicaciones de un usuario} & \footnotesize Query: page, limit & JWT & \ok{200} & \errs{400}\\
\end{longtable}}

\textbf{\color{mayorgreen}Publicaciones}

{\tablestyle
\begin{longtable}{@{}>{\centering\arraybackslash}p{1.6cm}>{\raggedright\arraybackslash}p{4.15cm}>{\raggedright\arraybackslash}p{3.5cm}>{\raggedright\arraybackslash}p{1.65cm}>{\centering\arraybackslash}p{1.1cm}>{\centering\arraybackslash}p{1.4cm}@{}}
\caption{Recursos de publicaciones}\\
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endhead
\POST & \route{/publications}{crear publicación} & \footnotesize text, necesidades[\{name\}] & JWT {\scriptsize(Beneficiario)} & \ok{201} & \errs{400, 403}\\
\GET & \route{/publications}{ver publicaciones aprobadas} & \footnotesize Query: page, limit, status {\scriptsize(solo admin)}, search & JWT & \ok{200} & \errs{400}\\
\GET & \route{/publications/:id}{detalle de publicación} & -- & JWT & \ok{200} & \errs{400, 404}\\
\PATCH & \route{/publications/:id}{editar publicación} & \footnotesize text, necesidades[\{name\}] & JWT {\scriptsize(Dueño)} & \ok{200} & \errs{400, 403, 404}\\
\DELETE & \route{/publications/:id}{eliminar publicación} & -- & JWT {\scriptsize(Dueño)} & \ok{204} & \errs{403, 404, 409}\\
\PATCH & \route{/publications/:id/status}{verificar publicación} & \footnotesize status: aprobada o rechazada & JWT {\scriptsize(Admin)} & \ok{200} & \errs{400, 403, 404, 409}\\
\PUT & \route{/publications/:id/image}{subir imagen de publicación} & \footnotesize multipart/form-data (campo “file”); jpeg/jpg/png/gif, máx. 5MB & JWT {\scriptsize(Dueño)} & \ok{200} & \errs{400, 403, 404, 415}\\
\end{longtable}}

\textbf{\color{mayorgreen}Reservas}

{\tablestyle
\begin{longtable}{@{}>{\centering\arraybackslash}p{1.6cm}>{\raggedright\arraybackslash}p{4.15cm}>{\raggedright\arraybackslash}p{3.4cm}>{\raggedright\arraybackslash}p{1.75cm}>{\centering\arraybackslash}p{1.1cm}>{\centering\arraybackslash}p{1.4cm}@{}}
\caption{Recursos de reservas}\\
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endhead
\POST & \route{/reservations}{reservar un ítem} & \footnotesize publication\_id, item\_id & JWT {\scriptsize(Donante)} & \ok{201} & \errs{400, 403, 409}\\
\GET & \route{/reservations}{mis reservas} & \footnotesize Query: status, page, limit & JWT & \ok{200} & \errs{400}\\
\GET & \route{/reservations/:id}{detalle de la reserva} & -- & JWT {\scriptsize(Dueño, donante o admin)} & \ok{200} & \errs{403, 404}\\
\PATCH & \route{/reservations/:id/status}{cambiar estado de la reserva} & \footnotesize status: cancelada {\scriptsize(solo donante)} o entregado {\scriptsize(dueño o donante)} & JWT {\scriptsize(Participante)} & \ok{200} & \errs{400, 403, 404, 409}\\
\end{longtable}}

\textbf{\color{mayorgreen}Notificaciones}

{\tablestyle
\begin{longtable}{@{}>{\centering\arraybackslash}p{1.6cm}>{\raggedright\arraybackslash}p{4.15cm}>{\raggedright\arraybackslash}p{3.4cm}>{\raggedright\arraybackslash}p{1.75cm}>{\centering\arraybackslash}p{1.1cm}>{\centering\arraybackslash}p{1.4cm}@{}}
\caption{Recursos de notificaciones}\\
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Verbo} & \hc{Ruta} & \hc{Cuerpo (JSON)} & \hc{Acceso} & \hc{Éxito} & \hc{Errores}\\
\endhead
\GET & \route{/notifications}{mis notificaciones} & \footnotesize Query: read, page, limit & JWT & \ok{200} & \errs{400}\\
\PATCH & \route{/notifications/:id}{marcar como leída} & \footnotesize read: true & JWT {\scriptsize(Dueño)} & \ok{200} & \errs{400, 403, 404}\\
\end{longtable}}

\subsection{Códigos de estado y formato de errores}

\Needspace{15\baselineskip}
\textbf{\color{mayorgreen}Códigos de estado utilizados}

\newcommand{\scode}[2]{\tcbox[on line,colback=#1,colframe=#1,boxrule=0pt,arc=2pt,left=4pt,right=4pt,top=1.5pt,bottom=1.5pt]{\sffamily\bfseries\small\color{white}#2}}
{\tablestyle
\begin{longtable}{@{}>{\centering\arraybackslash}p{1.9cm}>{\raggedright\arraybackslash}p{12.3cm}@{}}
\caption{Códigos de estado HTTP utilizados por la API (Fielding et al., 2022)}\\
\rowcolor{mayorgreen}\hc{Código} & \hc{Uso}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Código} & \hc{Uso}\\
\endhead
\scode{mayorgreen}{200} & Consulta o modificación exitosa (también lista vacía)\\
\scode{mayorgreen}{201} & Recurso creado (usuario, publicación, reserva)\\
\scode{mayorgreen}{204} & Eliminación exitosa, sin cuerpo\\
\scode{robinorange}{400} & Cuerpo, parámetros o identificador mal formados\\
\scode{robinorange}{401} & Falta el token, es inválido o expiró\\
\scode{robinorange}{403} & Autenticado pero sin permiso (rol o propiedad del recurso)\\
\scode{robinorange}{404} & El recurso no existe\\
\scode{robinorange}{409} & Conflicto de estado (necesidad/item ya reservado, correo repetido, transición no permitida)\\
\scode{robinorange}{415} & Archivo de tipo no permitido\\
\scode{dangerred}{500} & Falla inesperada del servidor\\
\end{longtable}}




\textbf{\color{mayorgreen}Formato de respuesta estándar}

\begin{codebox}[language=json,literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1 {0}{{\color{jsblue}0}}1 {1}{{\color{jsblue}1}}1 {2}{{\color{jsblue}2}}1 {3}{{\color{jsblue}3}}1 {4}{{\color{jsblue}4}}1 {5}{{\color{jsblue}5}}1 {6}{{\color{jsblue}6}}1 {7}{{\color{jsblue}7}}1 {8}{{\color{jsblue}8}}1 {9}{{\color{jsblue}9}}1 {...}{{\color{jsred}...}}3]{mayorgreen}{Éxito}
{
  "status": "success",
  "statusCode": 200,
  "data": { ... },
  "meta": { "page": 1, "limit": 10, "total": 100, "pages": 10 }
}
\end{codebox}

\begin{codebox}[language=json,literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1 {0}{{\color{jsblue}0}}1 {1}{{\color{jsblue}1}}1 {2}{{\color{jsblue}2}}1 {3}{{\color{jsblue}3}}1 {4}{{\color{jsblue}4}}1 {5}{{\color{jsblue}5}}1 {6}{{\color{jsblue}6}}1 {7}{{\color{jsblue}7}}1 {8}{{\color{jsblue}8}}1 {9}{{\color{jsblue}9}}1]{dangerred}{Error}
{
  "status": "error",
  "statusCode": 409,
  "error": { "code": "NEED_NOT_AVAILABLE", "message": "...", "details": [] }
}
\end{codebox}

\subsection{Ejemplos de carga útil}

\begin{codebox}[language=json,literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1]{vPOST}{Petición: POST /api/v1/reservations}
{
  "publication_id": "6ae5b687461f2637882e28ca",
  "item_id": "6ae7b8b9f598b91e5c8cad76"
}
\end{codebox}

\begin{codebox}[language=json,literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1]{mayorgreen}{Respuesta: 201 Created}
{
  "status": "success",
  "statusCode": 201,
  "data": {
    "_id": "6ae8fc710a6623739cc888ff",
    "publication_id": "6ae5b687461f2637882e28ca",
    "item_id": "6ae7b8b9f598b91e5c8cad76",
    "status": "reservado",
    "reserved_at": "2026-11-02T21:11:13.743Z"
  }
}
\end{codebox}

\textbf{\color{dangerred}Caso: Error de Permisos (Forbidden)}

Petición: \DELETE{} \code{/api/v1/publications/{id}} (siendo un usuario que no es el dueño). Respuesta: \textbf{403 Forbidden}

\begin{codebox}[language=json,literate={á}{{\'a}}1 {é}{{\'e}}1 {í}{{\'i}}1 {ó}{{\'o}}1 {ú}{{\'u}}1 {ñ}{{\~n}}1 {0}{{\color{jsblue}0}}1 {1}{{\color{jsblue}1}}1 {2}{{\color{jsblue}2}}1 {3}{{\color{jsblue}3}}1 {4}{{\color{jsblue}4}}1 {5}{{\color{jsblue}5}}1 {6}{{\color{jsblue}6}}1 {7}{{\color{jsblue}7}}1 {8}{{\color{jsblue}8}}1 {9}{{\color{jsblue}9}}1]{dangerred}{Respuesta: 403 Forbidden}
{
  "status": "error",
  "statusCode": 403,
  "error": {
    "code": "FORBIDDEN",
    "message": "No tienes permiso para eliminar esta publicación",
    "details": []
  }
}
\end{codebox}

% ------------------------------------------------------------------ 4. CAPAS
\section{Separación de responsabilidades y capas}

\subsection{Arquitectura en capas}
El back end de Robin se organiza como un monolito en capas sobre Express (Express, s.f.-b). Cada petición HTTP atraviesa una cadena de capas con una única responsabilidad, y cada capa se comunica solo con la inmediatamente inferior. Se mantiene lo definido en el Hito 1 (routes, controllers, services y middlewares) y se agrega la capa repositories, según lo declarado en la sección 2.2.

Las capas se dividen en dos grupos. Las que conocen HTTP (routes, middlewares y controllers) trabajan con \code{req} y \code{res}. Las que no lo conocen (services, repositories y models) reciben y devuelven datos, por lo que pueden probarse y reutilizarse sin levantar el servidor. Además, hay componentes transversales usados por todas las capas: las \textbf{variables de entorno} (Node.js, s.f.), leídas donde cada módulo las necesita (conexión a la base en \code{database/connection.ts}, secreto y expiración del JWT en \code{services/jwt.ts}), \textbf{utils} (sobre de respuesta, errores de aplicación y utilidades de serialización) y el manejador central de errores (Express, s.f.-a).

\begin{figure}[H]
\centering
\begin{tikzpicture}[x=1cm,y=1cm]
  \node[rounded corners=4pt,fill=cream,draw=robingreen,line width=0.8pt,minimum width=7cm,minimum height=0.95cm,
        font=\sffamily\small,align=center] (cli) at (0,0) {\textbf{Cliente}\\[-1pt]{\scriptsize React (Hito 3) $\cdot$ HTTP + JSON bajo \code{/api/v1}}};
  \node[layer,fill=lyroutes,below=0.5cm of cli] (rt) {\textbf{Routes}\\[-1pt]{\scriptsize verbo y ruta $\rightarrow$ controller}};
  \node[layer,fill=lymiddle,below=0.4cm of rt] (mw) {\textbf{Middlewares}\\[-1pt]{\scriptsize JWT $\cdot$ roles $\cdot$ carga de archivos $\cdot$ validación}};
  \node[layer,fill=lycontrol,below=0.4cm of mw] (ct) {\textbf{Controllers}\\[-1pt]{\scriptsize leen \code{req}, llaman al service, responden}};
  \node[layer,fill=lyservice,below=0.4cm of ct] (sv) {\textbf{Services}\\[-1pt]{\scriptsize reglas de negocio, permisos y transiciones}};
  \node[layer,fill=lyrepo,below=0.4cm of sv] (rp) {\textbf{Repositories}\\[-1pt]{\scriptsize consultas y operaciones atómicas}};
  \node[layer,fill=lymodel,below=0.4cm of rp] (md) {\textbf{Models}\\[-1pt]{\scriptsize esquemas, tipos, enums e índices (Mongoose)}};
  \node[cylinder,shape border rotate=90,aspect=0.22,fill=lydb,draw=mayorgreen,line width=0.8pt,text=white,
        font=\sffamily\bfseries\small,minimum width=3.2cm,minimum height=1.3cm,below=0.5cm of md] (db) {MongoDB};

  \foreach \a/\b in {cli/rt,rt/mw,mw/ct,ct/sv,sv/rp,rp/md}{
    \draw[arr] ([xshift=-3mm]\a.south) -- ([xshift=-3mm]\b.north);
    \draw[arrg] ([xshift=3mm]\b.north) -- ([xshift=3mm]\a.south);
  }
  \draw[arr] ([xshift=-3mm]md.south) -- ([xshift=-3mm]db.north |- md.south |- db.north);
  \draw[arrg] ([xshift=3mm]db.north) -- ([xshift=3mm]md.south);

  % Llaves a la izquierda
  \draw[decorate,decoration={brace,amplitude=6pt},thick,color=mayorgreen]
    ([xshift=-4mm]rt.north west) -- node[left=8pt,font=\sffamily\scriptsize,align=right,text width=2.5cm,color=mayordark]{\textbf{Conocen HTTP}\\trabajan con \code{req} y \code{res}} ([xshift=-4mm]ct.south west);
  \draw[decorate,decoration={brace,amplitude=6pt},thick,color=lyservice]
    ([xshift=-4mm]sv.north west) -- node[left=8pt,font=\sffamily\scriptsize,align=right,text width=2.5cm,color=lyservice]{\textbf{No conocen HTTP}\\reciben y devuelven datos: se prueban sin levantar el servidor} ([xshift=-4mm]md.south west);

  % Transversales a la derecha
  \node[rounded corners=5pt,draw=robinorange,dashed,line width=1pt,fill=robinorange!6,minimum width=3.7cm,minimum height=7.2cm,
        anchor=west] (tr) at ([xshift=1.4cm]ct.east |- sv.east) {};
  \node[font=\sffamily\bfseries\small,color=robinorange] at ([yshift=-0.35cm]tr.north) {Transversales};
  \node[rounded corners=3pt,fill=white,draw=robinorange!70,minimum width=3.3cm,font=\sffamily\scriptsize,align=center,inner sep=4pt] at ([yshift=-1.8cm]tr.north) {\textbf{database/}\\conexión a MongoDB\\(lee \code{MONGODB\_URI})};
  \node[rounded corners=3pt,fill=white,draw=robinorange!70,minimum width=3.3cm,font=\sffamily\scriptsize,align=center,inner sep=4pt] at ([yshift=-3.6cm]tr.north) {\textbf{utils}\\sobre de respuesta,\\AppError y JWT};
  \node[rounded corners=3pt,fill=white,draw=robinorange!70,minimum width=3.3cm,font=\sffamily\scriptsize,align=center,inner sep=4pt] at ([yshift=-5.5cm]tr.north) {\textbf{errorHandler}\\manejador central\\de errores};
  \draw[dashed,thick,color=robinorange] ([xshift=4mm]rt.north east) -- ([xshift=4mm]md.south east);
  \draw[dashed,thick,color=robinorange] ([xshift=4mm]rt.north east |- tr.west) -- (tr.west);
\end{tikzpicture}
\caption{Arquitectura en capas del backend de Robin: flujo de la petición (gris) y de la respuesta (verde).}
\end{figure}

\subsection{Estructura de carpetas}

\begin{codebox}[language=tree,basicstyle=\ttfamily\fontsize{7.2}{8.8}\selectfont]{mayorgreen}{src/}
├── server.ts                  # Arranque (Entry Point)
├── app.ts                     # Configuración Global (Express, Middlewares Globales)
│
├── routes/                    # (*@\lyr{lyroutes}@*) CAPA: ROUTES (Asocia Verbo/Ruta → Controller)
│   ├── user.ts                # Rutas de usuarios (incluye guardados y /users/:id/publications)
│   ├── publication.ts         # Rutas de publicaciones
│   ├── reservation.ts         # Rutas de reservas
│   └── notification.ts        # Rutas de notificaciones
│
├── middlewares/               # (*@\lyr{lymiddle}@*) CAPA: MIDDLEWARES (Validación de Token, Rol y Payload)
│   ├── auth.ts                # Verificación de JWT
│   ├── roles.ts                # Control de acceso por rol
│   ├── upload.ts              # Manejo de archivos de avatar (Multer)
│   └── errorHandler.ts        # Manejador global de errores
│
├── controllers/               # (*@\lyr{lycontrol}@*) CAPA: CONTROLLERS (HTTP → Servicio → Respuesta)
│   ├── user.ts                # Lógica de entrada/salida de Usuarios
│   ├── publication.ts         # Lógica de entrada/salida de Publicaciones
│   ├── reservation.ts         # Lógica de entrada/salida de Reservas
│   └── notification.ts        # Lógica de entrada/salida de Notificaciones
│
├── services/                  # (*@\lyr{lyservice}@*) CAPA: SERVICES (Lógica de Negocio y Permisos de Propiedad)
│   ├── auth.service.ts        # Lógica de autenticación
│   ├── user.service.ts        # Reglas de negocio de Usuarios
│   ├── publication.service.ts # Reglas de negocio de Publicaciones
│   ├── reservation.service.ts # Reglas de negocio de Reservas
│   ├── notification.service.ts # Reglas de negocio de Notificaciones
│   └── jwt.ts                 # Gestión de tokens (Lógica de servicio)
│
├── repositories/              # (*@\lyr{lyrepo}@*) CAPA: REPOSITORIES (Consultas Atómicas y Persistencia)
│   ├── user.repository.ts         # Consultas MongoDB de Usuarios
│   ├── publication.repository.ts  # Consultas MongoDB de Publicaciones
│   ├── reservation.repository.ts  # Consultas MongoDB de Reservas
│   └── notification.repository.ts # Consultas MongoDB de Notificaciones
│
├── models/                    # (*@\lyr{lymodel}@*) CAPA: MODELS / MongoDB (Esquemas y Tipos)
│   ├── user.ts                # Esquema de Usuario
│   ├── publication.ts         # Esquema de Publicación
│   ├── reservation.ts         # Esquema de Reserva
│   └── notification.ts        # Esquema de Notificación
│
├── types/                     # TIPADO (Específico de TypeScript)
│   ├── domain.ts              # Tipos y Enums del dominio (Roles, Estados)
│   └── express.d.ts           # Extensión de Request para incluir req.user
│
├── utils/                     # Soporte: Utilidades transversales
│   ├── response.ts            # Constructor del sobre de respuesta
│   ├── AppError.ts            # Clase de errores de negocio
│   ├── serializePublication.ts # Serialización compartida de publicaciones (con autor poblado)
│   └── escapeRegex.ts         # Escapa texto de usuario antes de usarlo en un $regex de Mongo
│
└── database/                  # Configuración de Base de Datos
    └── connection.ts          # Gestión de conexión a MongoDB
\end{codebox}

\subsection{Reglas de capas}

\newcommand{\lname}[2]{\textcolor{#1}{\rule[-0.1ex]{0.5em}{0.9em}}~\textbf{#2}}
{\tablestyle
\begin{longtable}{@{}>{\raggedright\arraybackslash}p{2.9cm}>{\raggedright\arraybackslash}p{5.9cm}>{\raggedright\arraybackslash}p{5.4cm}@{}}
\caption{Qué puede y qué no puede hacer cada capa}\\
\rowcolor{mayorgreen}\hc{Capa} & \cellcolor{robingreen}\hc{Puede} & \cellcolor{dangerred}\hc{No puede}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Capa} & \cellcolor{robingreen}\hc{Puede} & \cellcolor{dangerred}\hc{No puede}\\
\endhead
\lname{lyroutes}{Route} & Declarar endpoint y verbo; encadenar middlewares y controller & Contener lógica o consultas.\\
\lname{lymiddle}{Middlewares} & Verificar token, rol y forma de los datos & Aplicar reglas de negocio o consultar la base\\
\lname{lycontrol}{Controllers} & Leer \code{req}, llamar a un service y responder con \code{utils/response} & Importar repositories o models; decidir reglas; armar el sobre manualmente.\\
\lname{lyservice}{Services} & Aplicar reglas, permisos y transiciones; llamar repositories/services; lanzar \code{AppError} & Conocer \code{req}, \code{res}, Express, Mongoose o models\\
\lname{lyrepo}{Repositories} & Ejecutar consultas y operaciones atómicas. & Contener reglas de negocio o conocer HTTP\\
\lname{lymodel}{Models} & Definir esquema, tipos, enums e índices. & Contener lógica de negocio o consultas.\\
\end{longtable}}

\begin{callout}
\textbf{\color{mayordark}Regla de dependencia:} Las dependencias van hacia abajo: routes $\rightarrow$ middlewares/controllers $\rightarrow$ services $\rightarrow$ repositories $\rightarrow$ models. Ninguna capa se salta a la siguiente ni depende de una superior.
\end{callout}

\subsection{Recorrido de peticiones}

\textbf{\color{mayorgreen}Ejemplo: Reservar un ítem de una publicación}

A continuación se describe la travesía de una petición \POST{} \code{/api/v1/reservations}.

\begin{figure}[H]
\centering
\resizebox{\linewidth}{!}{%
\begin{tikzpicture}
  \node[flow,fill=lyroutes] (n1) at (0,0) {Routes};
  \node[flow,fill=lymiddle,right=0.32cm of n1] (n2) {Middleware\\auth};
  \node[flow,fill=lymiddle,right=0.32cm of n2] (n2b) {Middleware\\roles};
  \node[flow,fill=lycontrol,right=0.32cm of n2b] (n3) {Controller};
  \node[flow,fill=lyservice,right=0.32cm of n3] (n4) {Service};
  \node[flow,fill=lyrepo,right=0.32cm of n4] (n5) {Repository};
  \node[flow,fill=lymodel,right=0.32cm of n5] (n6) {Models};
  \node[flow,fill=mayordark,right=0.32cm of n6] (n7) {Response\\\code{201}};
  \foreach \a/\b in {n1/n2,n2/n2b,n2b/n3,n3/n4,n4/n5,n5/n6,n6/n7}{\draw[arr] (\a) -- (\b);}
  \foreach \n/\c in {n2/401,n2b/403,n3/400,n4/409,n5/500}{
    \draw[-{Stealth[length=1.6mm]},color=dangerred,thick] (\n.south) -- ++(0,-0.45);
    \node[errchip,below=0.5cm of \n.south] {\c};}
\end{tikzpicture}}
\caption{Recorrido de \code{POST /api/v1/reservations} por las capas; en rojo, el código de error que puede originar cada una. No hay un 404 propio de este flujo: una publicación o ítem inexistente se resuelve en el mismo 409 que un ítem ya reservado (ver tabla de reservas).}
\end{figure}

{\tablestyle
\begin{longtable}{@{}>{\raggedright\arraybackslash}p{2.1cm}>{\raggedright\arraybackslash}p{3.3cm}>{\raggedright\arraybackslash}p{4.7cm}>{\raggedright\arraybackslash}p{3.75cm}@{}}
\caption{Recorrido de la petición de reserva a través de las capas}\\
\rowcolor{mayorgreen}\hc{Capa} & \hc{Archivo} & \hc{Caso exitoso} & \hc{Caso de error}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Capa} & \hc{Archivo} & \hc{Caso exitoso} & \hc{Caso de error}\\
\endhead
\lname{lyroutes}{Routes} & {\ttfamily\scriptsize routes/reservation.ts} & Recibe la petición y verifica que el verbo sea POST. Encadena \code{auth}, \code{roles(["donante"])} y el controlador. & ---\\
\lname{lymiddle}{Middleware} & {\ttfamily\scriptsize auth.ts} & Extrae el token Bearer, lo valida y adjunta el usuario al objeto \code{req.user}. & \errs{\textbf{401 Unauthorized:}} Token inválido o ausente.\\
\lname{lymiddle}{Middleware} & {\ttfamily\scriptsize roles.ts} & Verifica que \code{req.user.role} sea \code{donante}. & \errs{\textbf{403 Forbidden:}} Si el rol autenticado no es donante.\\
\lname{lycontrol}{Controller} & {\ttfamily\scriptsize reservation.ts} & Extrae \code{publication\_id} e \code{item\_id} del cuerpo. Llama al servicio de reservas. & \errs{\textbf{400 Bad Request:}} Si faltan campos obligatorios (lanza \code{AppError}).\\
\lname{lyservice}{Service} & {\ttfamily\scriptsize reservation.
service.ts} & Pide la reserva atómica al repositorio de publicaciones y, si hay coincidencia, crea el documento de reserva y notifica al beneficiario. & \errs{\textbf{409 Conflict:}} Si el repositorio no encontró coincidencia (publicación no aprobada, o ítem inexistente/no disponible).\\
\lname{lyrepo}{Repository} & {\ttfamily\scriptsize publication.
repository.ts} +\newline{\ttfamily\scriptsize reservation.
repository.ts} & Ejecuta el \code{findOneAndUpdate} (Mongoose, s.f.-a; MongoDB, s.f.-a) atómico sobre la publicación y, si tuvo éxito, inserta el documento de reserva.\footnotemark & \errs{\textbf{500 Internal Error:}} Fallo de conexión o error de base de datos.\\
\lname{lymodel}{Models} & {\ttfamily\scriptsize publication.ts} & Mongoose traduce la condición y el \code{\$set} a una operación atómica de MongoDB (Mongoose, s.f.-c). & ---\\
\lname{mayordark}{Response} & {\ttfamily\scriptsize utils/response.ts} & El controlador recibe el resultado y usa \code{sendSuccess} para envolver la data en el sobre estándar. & ---\\
\end{longtable}}
\footnotetext{Una operación sobre un único documento en MongoDB es atómica: la condición de búsqueda y la modificación se aplican como un solo paso, sin que otra petición pueda intercalarse.}

\begin{codebox}[language=ts]{lyroutes}{1 $\cdot$ ROUTE}
// 1. ROUTE: Definición del endpoint
// src/routes/reservation.ts
router.post("/", auth, roles(["donante"]), ReservationController.create);
// Enlace: Ruta -> Auth -> Rol -> Controller
\end{codebox}

\begin{codebox}[language=ts]{lycontrol}{2 $\cdot$ CONTROLLER}
// 2. CONTROLLER: Traducción HTTP -> Servicio
// src/controllers/reservation.ts
async create(req: Request, res: Response, next: NextFunction) {
  try {
    const { publication_id, item_id } = req.body;
    if (!publication_id || !item_id) {
      throw new AppError("VALIDATION_ERROR", 400, "El publication_id y el item_id son obligatorios");
    }
    const donorId = req.user!.id; // viene del token, no del cuerpo
    const reservation = await reservationService.createReservation(donorId, publication_id, item_id);
    sendSuccess(res, { _id: reservation._id, publication_id: reservation.publication_id,
      item_id: reservation.item_id, status: reservation.status, reserved_at: reservation.reserved_at }, 201);
  } catch (error) {
    next(error); // Propaga el error al errorHandler
  }
}
\end{codebox}

\begin{codebox}[language=ts]{lyservice}{3 $\cdot$ SERVICE}
// 3. SERVICE: Reglas de negocio y validación de estado
// src/services/reservation.service.ts
async createReservation(donorId, publicationId, itemId) {
  // Actualización condicionada: solo marca "reservado" si la publicación está
  // "aprobada" y el ítem sigue "disponible". Si no, no devuelve nada.
  const publication = await publicationRepository.atomicReserveItem(publicationId, itemId);
  if (!publication) {
    throw new AppError("NEED_NOT_AVAILABLE", 409, "La necesidad fue reservada");
  }
  try {
    const reservation = await reservationRepository.create({ publication_id: publicationId, item_id: itemId, donor_id: donorId, status: "reservado" });
    await notificationService.createNotification(publication.user_id.toString(), "confirmación", "Un donante ha reservado el ítem...");
    return reservation;
  } catch (error) {
    // Sin transacciones multi-documento: si falla la creación de la reserva,
    // se revierte manualmente el ítem a "disponible".
    await publicationRepository.updateItemStatus(publicationId, itemId, "disponible");
    throw error;
  }
}
\end{codebox}

\begin{codebox}[language=ts]{lyrepo}{4 $\cdot$ REPOSITORY}
// 4. REPOSITORY: Operación atómica en MongoDB
// src/repositories/publication.repository.ts
async atomicReserveItem(publicationId, itemId) {
  return await Publication.findOneAndUpdate(
    { _id: publicationId, status: "aprobada",
      necesidades: { $elemMatch: { _id: itemId, status: "disponible" } } },
    { $set: { "necesidades.$.status": "reservado" } },
    { new: true }
  ).select("-__v");
}
\end{codebox}

% ------------------------------------------------------------------ 5. PERSISTENCIA
\section{Persistencia y manejo de credenciales}

\subsection{Modelo de datos}

\begin{figure}[H]
\centering
\resizebox{\linewidth}{!}{%
\begin{tikzpicture}[
  ent/.style={rectangle split,rectangle split parts=2,rectangle split part fill={#1,white},draw=#1,line width=0.9pt,
    rounded corners=3pt,minimum width=4cm,font=\sffamily\scriptsize,align=left,inner xsep=6pt,inner ysep=4pt,
    drop shadow={opacity=.18}},
  rel/.style={thick,color=robingreen},
  rlab/.style={font=\sffamily\tiny\bfseries,color=robinorange,fill=white,inner sep=1.5pt}]
  \node[ent=mayorgreen] (u) at (0,0)
    {\textcolor{white}{\bfseries\small Usuario}\nodepart{two}\ttfamily\_id\\name\\surname\\nick\\email\\password\\role\\image\\createdAt};
  \node[ent=lyrepo] (p) at (7.4,0.35)
    {\textcolor{white}{\bfseries\small Publicación}\nodepart{two}\ttfamily\_id\\userId\\text\\status\\necesidades[\ ]\\createdAt\\file};
  \node[ent=robinorange,minimum width=3.3cm] (n) at (13.4,0.35)
    {\textcolor{white}{\bfseries\small Necesidad {\scriptsize(embebida)}}\nodepart{two}\ttfamily\_id\\name\\status};
  \node[ent=lyservice!70!black] (r) at (7.4,-4.6)
    {\textcolor{white}{\bfseries\small Reserva}\nodepart{two}\ttfamily\_id\\publicationId\\itemId\\donorId\\status\\reservedAt};
  \node[ent=lymodel,minimum width=3.3cm] (no) at (0,-4.9)
    {\textcolor{white}{\bfseries\small Notificación}\nodepart{two}\ttfamily\_id\\userId\\type\\message\\read\\createdAt};
  % Relaciones
  \draw[rel] (u.east) -- node[rlab,pos=0.5]{1 : N publica} (p.west);
  \draw[rel] (p.east) -- node[rlab,pos=0.5]{embebe 1 : N} (n.west);
  \draw[rel] (u.south east) -- node[rlab,pos=0.5]{1 : N reserva} (r.west);
  \draw[rel] (r.north) -- node[rlab,pos=0.5]{publication\_id} (p.south);
  \draw[rel,dashed] (r.east) -| node[rlab,pos=0.2]{item\_id} (n.south);
  \draw[rel] (u.south) -- node[rlab,pos=0.5]{1 : N recibe} (no.north);
\end{tikzpicture}}
\caption{Modelo de datos con enfoque mixto: necesidades embebidas en la publicación y colecciones referenciadas mediante \code{ObjectId}.}
\end{figure}
\textbf{Campos, tipos y restricciones}

\begin{codebox}[language=ts]{lyroutes}{Users}
{ _id: ObjectId, name: String, surname: String, nick: String, // unique
  email: String, // unique
  password: String, // hash; nunca se devuelve
  role: String, // beneficiario | donante | admin
  image: String, address: String, phone: String, verified: Boolean,
  created_at: Date,
  saved_publications: [ObjectId] } // referencias a Publication (Guardados)
\end{codebox}

\begin{codebox}[language=ts]{lyroutes}{Publications}
{ _id: ObjectId, user_id: ObjectId, text: String, file: String,
  status: String, // pendiente | aprobada | rechazada
  necesidades: [{ _id: ObjectId, name: String, status: String }],
    created_at: Date, file: String}
\end{codebox} 

\begin{codebox}[language=ts]{lyroutes}{Reservations}
{ _id: ObjectId, publication_id: ObjectId, item_id: ObjectId,
  donor_id: ObjectId, status: String, // reservado | entregado | cancelada
  reserved_at: Date, delivered_at: Date }
\end{codebox}

\begin{codebox}[language=ts]{lyroutes}{Notifications}
{ _id: ObjectId, user_id: ObjectId,
  type: String, // confirmación | alerta pendiente | conflicto
  message: String, read: Boolean, created_at: Date }
\end{codebox}


\textbf{Decisiones de diseño físico}
\begin{itemize}[leftmargin=1.5em]
\item \textbf{Necesidades embebidas:} se leen junto con su publicación, su cantidad es acotada y se evita una consulta adicional al mostrar el detalle.
\item \textbf{Reservations referenciadas:} tienen ciclo de vida propio y se consultan por donante y estado.
\item \textbf{Users referenciados:} evita duplicar datos personales en cada publicación o reserva.
\item \textbf{Guardados como arreglo de referencias en el usuario:} \code{saved\_publications} guarda solo \code{ObjectId}, no copias de la publicación; se actualiza con operadores atómicos de conjunto (\code{\$addToSet}/\code{\$pull}), por lo que guardar o quitar una publicación dos veces no produce duplicados ni error.
\end{itemize}


\subsection{Scripts y credenciales}

El despliegue y arranque del sistema se gestionan mediante scripts de Node.js definidos en el \code{package.json} (npm, s.f.). Para el desarrollo, se utiliza el comando \code{npm run dev}, que levanta el servidor en modo observador (watch mode), permitiendo que los cambios en el código se apliquen en tiempo real sin reiniciar el proceso manualmente (Node.js, s.f.).

La arquitectura de persistencia se divide en dos componentes con responsabilidades distintas:

\begin{enumerate}
    \item \textbf{Gestión de Conexión (\ruta{src/database/connection.ts}):} Es la infraestructura que mantiene el enlace activo entre la aplicación y MongoDB. Se ejecuta en cada arranque del servidor, leyendo la \code{MONGODB\_URI} del archivo de entorno para establecer la comunicación persistente.
    \item \textbf{Inicialización de Base de Datos (\ruta{db/init.ts}):} Es un script que se ejecuta manualmente (vía \code{npm run db:init}) para preparar la base de datos desde cero. Sus funciones principales son:
    \begin{itemize}
        \item Vaciar las cuatro colecciones (\code{users}, \code{publications}, \code{reservations}, \code{notifications}); es un script de base \textit{desde cero}, no una migración incremental, y por lo tanto es destructivo a propósito.
        \item Sincronizar los índices definidos en los esquemas (ej. unicidad de email y nick) con \code{syncIndexes()} (MongoDB, s.f.-e).
        \item Crear el usuario administrador inicial. El rol \code{admin} no puede crearse por registro público (sección 5), así que este script es el único punto donde nace la primera cuenta con ese rol.
        \item Crear datos de prueba: un usuario \code{beneficiario}, un usuario \code{donante}, publicaciones de ese beneficiario tanto aprobadas como pendientes de moderar, y reservas y notificaciones sobre ellas, para que la plataforma se vea poblada desde el primer arranque sin tener que registrarse ni actuar a mano.
    \end{itemize}
\end{enumerate}

A continuación se muestra el flujo de arranque recomendado y la configuración de entorno necesaria para desplegar el servicio:

\begin{codebox}[language=ts]{lyrepo}{1 $\cdot$ Preparación del entorno}
cp .env.example .env       # Crear archivo de entorno local
npm install                 # Instalar dependencias del proyecto
\end{codebox}

\begin{codebox}[language=ts]{lyrepo}{2 $\cdot$ Preparación de la base de datos (destructivo: vacía y recrea)}
npm run db:init             # Limpia, sincroniza índices y crea admin + datos de prueba
\end{codebox}

\begin{codebox}[language=ts]{lyrepo}{3 $\cdot$ Ejecución del servicio}
npm run dev                 # Arranca servidor en modo desarrollo 
\end{codebox}

\begin{codebox}[language=ts]{lyrepo}{.env.example (valores de ejemplo)}
PORT=3900
MONGODB_URI=mongodb://localhost:27017/robin_db
JWT_SECRET=clave-secreta-aleatoria-larga
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads/publications
\end{codebox}

\begin{codebox}[language=ts]{lyrepo}{.gitignore}
node_modules/
.env
uploads/*
!uploads/.gitkeep
run-project.bat
\end{codebox}


\textbf{Prácticas adoptadas}
\begin{enumerate}[leftmargin=1.5em]
\item \textbf{Exclusión de secretos:} el \code{.env} real no se versiona; proporcionando solo la plantilla \code{.env.example} (Wiggins, 2011).
\item \textbf{Falla temprana:} El sistema valida la existencia de las variables de entorno críticas al arrancar el servidor.
\item \textbf{Mínimo privilegio:} Se utiliza una URI de conexión restringida al entorno de la base de datos.
\item \textbf{Secretos por entorno:} desarrollo y despliegue usan valores distintos; \code{JWT\_SECRET} es largo y aleatorio (Wiggins, 2011).
\item \textbf{Rotación:} si una credencial se publica, se invalida, se reemplaza y se limpia el historial.
\item \textbf{CORS acotado por configuración:} el middleware \code{cors} lee el origen permitido desde \code{CORS\_ORIGIN} en vez de aceptar cualquier origen por defecto.


\end{enumerate}


% ------------------------------------------------------------------ 6. CONCLUSIÓN
\section{Conclusión}

Este hito permitió construir y documentar el backend de Robin mediante una API REST con persistencia en MongoDB, organizada en capas con responsabilidades separadas y con credenciales protegidas fuera del repositorio. Se mantuvo el concepto definido en el Hito 1, basado en una wishlist de bienes con el ciclo de vida disponible $\rightarrow$ reservado $\rightarrow$ entregado, y se establecieron los cambios necesarios junto con sus motivos e impactos.

Las decisiones centrales fueron cuatro. \textbf{\color{robinorange}Primero,} adoptar una arquitectura de monolito en capas, adecuada para un proyecto semestral con un equipo pequeño y un despliegue sencillo. \textbf{\color{robinorange}Segundo,} incorporar la capa de repositorios (repositories), encargada de centralizar las consultas y mantener las reglas de negocio independientes de Mongoose. \textbf{\color{robinorange}Tercero,} definir un contrato de API orientado a recursos, versionado bajo \code{/api/v1} y con un formato de respuesta consistente. \textbf{\color{robinorange}Cuarto,} implementar un mecanismo de reserva atómica que impida que dos donantes reserven la misma necesidad.

\newcommand{\decision}[3]{%
  \begin{tcolorbox}[enhanced,colback=white,colframe=lightgreen,boxrule=0.8pt,arc=4pt,
    top=6pt,bottom=6pt,left=4pt,right=4pt,halign=center,valign=center,
    borderline north={3pt}{0pt}{#1},shadow={0.6mm}{-0.6mm}{0mm}{black!12}]
    {\fontsize{22}{24}\selectfont\bfseries\color{#1}#2}\\[1pt]{\footnotesize\bfseries\color{robingreen}#3}
  \end{tcolorbox}}
\begin{tcbraster}[raster columns=4,raster equal height,raster column skip=7pt]
  \decision{mayorgreen}{1}{Monolito en capas}
  \decision{lyrepo}{2}{Capa repositories}
  \decision{robinorange}{3}{Contrato \texttt{/api/v1}}
  \decision{dangerred}{4}{Reserva atómica}
\end{tcbraster}

\vspace{4pt}
Asimismo, se reconocieron y documentaron las limitaciones del proyecto, tanto legales como técnicas, manteniendo un alcance que permita justificar y defender las decisiones adoptadas.

En el Hito 3, el backend servirá como base para integrar el frontend desarrollado en React y desplegar el sistema, culminando con la entrega de un producto funcional.

% ------------------------------------------------------------------ 7. REFERENCIAS
\section{Referencias técnicas}
\begin{itemize}
    \item Express. (s. f.-a). \textit{Error handling}. \href{https://expressjs.com/en/guide/error-handling.html}{https://expressjs.com/en/guide/error-handling.html} 
    \item Express. (s. f.-b). \textit{Express: Node.js web application framework}. \href{https://expressjs.com/}{https://expressjs.com/} 
    \item Express. (s. f.-c). \textit{Routing}. \href{https://expressjs.com/en/guide/routing.html}{https://expressjs.com/en/guide/routing.html} 
    \item Express. (s. f.-d). \textit{Using middleware}. \href{https://expressjs.com/en/guide/using-middleware.html}{https://expressjs.com/en/guide/using-middleware.html} 
    \item Fielding, R. T. (2000). \textit{Architectural styles and the design of network-based software architectures} [Tesis doctoral, University of California, Irvine]. \href{https://ics.uci.edu/~fielding/pubs/dissertation/top.htm}{https://ics.uci.edu/\~fielding/pubs/dissertation/top.htm} 
    \item Fielding, R., Nottingham, M., \& Reschke, J. (2022). \textit{HTTP semantics} (RFC 9110). RFC Editor. \href{https://www.rfc-editor.org/info/rfc9110}{https://www.rfc-editor.org/info/rfc9110} 
    \item Jones, M., Bradley, J., \& Sakimura, N. (2015). \textit{JSON Web Token (JWT)} (RFC 7519). RFC Editor. \href{https://www.rfc-editor.org/info/rfc7519}{https://www.rfc-editor.org/info/rfc7519} 
    \item Jones, M., \& Hardt, D. (2012). \textit{The OAuth 2.0 authorization framework: Bearer token usage} (RFC 6750). RFC Editor. \href{https://www.rfc-editor.org/info/rfc6750}{https://www.rfc-editor.org/info/rfc6750} 
    \item Microsoft. (s. f.). \textit{TypeScript documentation}. \href{https://www.typescriptlang.org/docs/}{https://www.typescriptlang.org/docs/} 
    \item MongoDB. (s. f.-a). \textit{Atomicity and transactions}. MongoDB Manual. \href{https://www.mongodb.com/docs/manual/core/write-operations-atomicity/}{https://www.mongodb.com/docs/manual/core/write-operations-atomicity/} 
    \item MongoDB. (s. f.-b). \textit{BSON types}. MongoDB Manual. \href{https://www.mongodb.com/docs/manual/reference/bson-types/}{https://www.mongodb.com/docs/manual/reference/bson-types/} 
    \item MongoDB. (s. f.-c). \textit{Embedded data versus references}. MongoDB Manual. \href{https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/}{https://www.mongodb.com/docs/manual/data-modeling/concepts/embedding-vs-references/} 
    \item MongoDB. (s. f.-d). \textit{MongoDB manual}. \href{https://www.mongodb.com/docs/manual/}{https://www.mongodb.com/docs/manual/} 
    \item MongoDB. (s. f.-e). \textit{Unique indexes}. MongoDB Manual. \href{https://www.mongodb.com/docs/manual/core/index-unique/}{https://www.mongodb.com/docs/manual/core/index-unique/} 
    \item Mongoose. (s. f.-a). \textit{Model.findOneAndUpdate()}. \href{https://mongoosejs.com/docs/api/model.html}{https://mongoosejs.com/docs/api/model.html} 
    \item Mongoose. (s. f.-b). \textit{Schemas}. \href{https://mongoosejs.com/docs/guide.html}{https://mongoosejs.com/docs/guide.html} 
    \item Mongoose. (s. f.-c). \textit{Validation}. \href{https://mongoosejs.com/docs/validation.html}{https://mongoosejs.com/docs/validation.html} 
    \item Node.js. (s. f.). \textit{Node.js documentation}. \href{https://nodejs.org/docs/latest/api/}{https://nodejs.org/docs/latest/api/} 
    \item npm. (s. f.). \textit{Scripts}. npm Docs. \href{https://docs.npmjs.com/cli/v10/using-npm/scripts}{https://docs.npmjs.com/cli/v10/using-npm/scripts} 
    \item Preston-Werner, T. (s. f.). \textit{Semantic versioning 2.0.0}. \href{https://semver.org/}{https://semver.org/} 
    \item React. (s. f.). \textit{React}. \href{https://react.dev/}{https://react.dev/} 
    \item Robles, V. (2026). \textit{Master en APIs RESTful con Node.js. Udemy}. \href{https://www.udemy.com/course/master-en-apis-restful-con-nodejs-crea-3-backends-completos/?couponCode=UDEAFFMX1126}{https://www.udemy.com/course/master-en-apis-restful-con-nodejs-crea-3-backends-completos/} 
    \item Wiggins, A. (2011). \textit{The twelve-factor app: III. Config}. \href{https://12factor.net/config}{https://12factor.net/config} 
\end{itemize}

% ------------------------------------------------------------------ 8. ANEXO IA

\section{Anexo: uso de IA}
\label{anexo:uso-ia}

Durante el desarrollo del proyecto se utilizaron herramientas de inteligencia artificial como apoyo a la programación y a la redacción del informe. Las decisiones de diseño, la revisión del código y la responsabilidad sobre el contenido final son del equipo. Todo el código entregado fue revisado y probado antes de incorporarse al repositorio.

\subsection{Herramientas utilizadas}
\begin{longtable}{@{}>{\raggedright\arraybackslash}p{2.6cm}>{\raggedright\arraybackslash}p{3.1cm}>{\raggedright\arraybackslash}p{7.0cm}@{}}
\caption{Herramientas utilizadas como apoyo durante el proyecto}\\
\rowcolor{mayorgreen}\hc{Herramienta} & \hc{Modelo o versión} & \hc{Uso en el proyecto}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Herramienta} & \hc{Modelo o versión} & \hc{Uso en el proyecto}\\
\endhead
Claude Code & gpt-oss:20b vía API de Ollama & Adaptación de la API base, refactorización a capas, implementación de recursos, validación y manejo de errores.\\
Claude (chat) & Sonnet 5.5 & Redacción y estructuración del informe, revisión de criterios de la rúbrica, ejemplos de carga útil y diagramas.\\
Postman & -- & Verificación funcional de endpoints; no es una herramienta de IA.\\
MongoDB Compass & -- & Verificación de persistencia de datos; no es una herramienta de IA.\\
\end{longtable}


\subsection{Uso por fase del proyecto}
\begin{longtable}{@{}>{\raggedright\arraybackslash}p{2.5cm}>{\raggedright\arraybackslash}p{3.6cm}>{\raggedright\arraybackslash}p{4.1cm}>{\raggedright\arraybackslash}p{2.5cm}@{}}
\caption{Participación de la IA y del equipo por fase}\\
\rowcolor{mayorgreen}\hc{Fase} & \hc{Qué hizo la IA} & \hc{Qué hizo el equipo} & \hc{Verificación}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Fase} & \hc{Qué hizo la IA} & \hc{Qué hizo el equipo} & \hc{Verificación}\\
\endhead
Contrato y modelo de datos & Propuso borradores de la tabla de API y de esquemas. & Decidió recursos, nombres, sobre de respuesta con \code{status} y \code{statusCode}, y confirmación manual de entregas. & Revisión contra Hito 1 y rúbrica.\\
Capas y refactor & Movió lógica de controllers a services y creó repositories. & Definió reglas por capa y revisó los cambios. & Revisión de dependencias y recorrido de petición.\\
Endpoints y reglas de negocio & Generó una implementación base de recursos. & Corrigió errores y ajustó códigos HTTP y transiciones. & Postman y MongoDB Compass.\\
Errores y seguridad & Propuso manejo central de errores y gestión de credenciales. & Validó variables de entorno, \code{.gitignore} y control por rol. & Casos 400, 401, 403, 404 y 409 en Postman.\\
Informe & Redactó borradores de secciones. & Editó los textos y comprobó su correspondencia con el código. & Lectura cruzada con el repositorio.\\
\end{longtable}

\subsection{Verificación de resultados}
\begin{itemize}
\item \textbf{Postman:} colección con peticiones de éxito y error por recurso, verificando código de estado y cuerpo de respuesta.
\item \textbf{MongoDB Compass:} después de las operaciones de escritura se comprobó la persistencia de documentos, sus estructuras y estados; también se revisaron colecciones e índices.
\item \textbf{Revisión de código:} lectura de cada cambio generado antes de incorporarlo al repositorio.
\end{itemize}

\setcounter{subsection}{3}\subsection{Uso de la API base previa}
El backend de Robin toma como punto de partida una API REST de una red social, desarrollada previamente como parte del curso de Udemy de Víctor Robles (Robles, 2026) \textit{Master en APIs RESTful} (repositorio \ruta{CalquinL/API_Red_social}). Sobre esa implementación inicial se realizaron modificaciones para adecuarla a los requerimientos funcionales y a la arquitectura definida para Robin. Se reutilizaron algunos componentes como base de trabajo, mientras que otros fueron reescritos y se incorporaron funcionalidades específicas del proyecto, según se detalla en la siguiente tabla:
\begin{longtable}{@{}>{\bfseries\raggedright\arraybackslash}p{2.7cm}>{\raggedright\arraybackslash}p{10.0cm}@{}}
\caption{Elementos reutilizados, reescritos y nuevos}\\
\rowcolor{mayorgreen}\hc{Categoría} & \hc{Elementos}\\
\endfirsthead
\rowcolor{mayorgreen}\hc{Categoría} & \hc{Elementos}\\
\endhead
Reutilizado & Autenticación JWT, modelos de usuario y publicación, paginación.\\
Reescrito & Estructura de capas, rutas por recurso y versionado, manejo de errores y formato de respuesta.\\
Nuevo & Necesidades, reservas, notificaciones, moderación de publicaciones y script de creación de la base de datos.\\
\end{longtable}

\end{document}