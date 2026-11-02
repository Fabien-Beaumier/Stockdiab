// Traductions de la notice (manual.js) : anglais et espagnol.
// Chaque chapitre garde la même structure que la version française (mêmes id, mêmes paragraphes et listes).
// Les noms de boutons reprennent exactement les textes affichés par l'application dans chaque langue.
// Pas d'entités HTML (&...;) : la mise en surbrillance de la recherche en dépend.

export const TAGS_I18N = {
  en: ['adding', 'alarm', 'settings', 'scanner', 'history', 'backup', 'prescription', 'expiry'],
  es: ['añadir', 'alarma', 'ajustes', 'escáner', 'historial', 'copia', 'receta', 'caducidad'],
};

export const TR = {
  en: {
    demarrer: { title: 'Getting started', keys: 'overview navigation tabs home start discover first steps',
      html: `<p>StockDiab helps you track your supplies (insulin, sensors, catheters, test strips, batteries…) and know when to restock. Everything is saved only on your phone: no account, no server.</p>
<p>The bottom bar has five tabs:</p>
<ul><li><b>Home</b>: the number of items, items below threshold and out-of-stock items, the "To restock" list, upcoming expiry dates and the "My alarms" button.</li>
<li><b>My stock</b>: all your items ("Supplies" tab) and your prescriptions ("My prescriptions" tab).</li>
<li><b>Add</b>: scan an item or create an item manually.</li>
<li><b>History</b>: every stock movement.</li>
<li><b>Settings</b>: language, theme, backup, user guide, about.</li></ul>
<p>To get started: open "Add", create your first items, then set the alert threshold of each one.</p>` },

    ajout: { title: 'Adding an item', keys: 'add adding create new item sheet manually scan unit initial quantity threshold barcode lot expiry notes category',
      html: `<p>On the <b>Add</b> tab, you have two options:</p>
<ul><li><b>Scan an item</b>: the camera reads the code on the box (see the chapter "Scanning a code").</li>
<li><b>Create an item manually</b>: a form opens.</li></ul>
<p>Fields of the item sheet:</p>
<ul><li><b>Product name</b> (required) and <b>Category</b> (optional, useful for searching).</li>
<li><b>Counting unit</b>: piece, box, pen, vial, cartridge, catheter, reservoir, sensor, battery, test strip, or any unit you like.</li>
<li><b>Initial quantity</b>: a whole number. If it is above 0, an "In" movement ("Item created") is added to the history.</li>
<li><b>Alert threshold</b>: the item becomes "Low stock" when the quantity is less than or equal to the threshold (1 by default).</li>
<li><b>Barcode</b> (optional): two items cannot share the same code.</li>
<li><b>Expiry date</b> and <b>Lot number</b> (optional).</li>
<li><b>Reference stock</b> (optional): the quantity that equals 100% of the stock bar.</li>
<li><b>Average use</b> (optional): see the chapter "Consumption estimate".</li>
<li><b>Notes</b>: free text, 500 characters maximum.</li></ul>
<p>You can edit a sheet later with the item's "Edit" button.</p>` },

    stock: { title: 'Managing your stock day to day', keys: 'my stock remove add withdrawal in out correction quantity search filter card collapse expand button',
      html: `<p>In <b>My stock</b>, each item is a card with four buttons:</p>
<ul><li><b>Remove 1</b>: removes one unit after confirmation (greyed out when stock is 0).</li>
<li><b>Remove…</b>: removes the quantity of your choice, with an optional note. You cannot remove more than what is left.</li>
<li><b>Add</b>: adds the quantity received (restocking), with an optional note.</li>
<li><b>Edit</b>: opens the item sheet to change it or delete the item.</li></ul>
<p>All removals are manual: the app calculates no dose and never removes anything by itself.</p>
<p>If the number shown is wrong, change the quantity in the item sheet: the difference is logged as a "Correction" in the history.</p>
<p><b>Search and filter</b>: the search field looks in the name, category and barcode. The filters are "All", "Low stock", "Out of stock" and "Expiring soon".</p>
<p><b>Collapsing a card</b>: tap the product name (arrow ▾) to keep only the name, the quantity and the stock bar. Tap it again to reopen the card. The "Collapse all" / "Expand all" button acts on all the cards shown. Your choice is remembered on the device.</p>
<p><b>The three states of an item</b>: "Stock OK" (quantity above the threshold), "Low stock" (quantity less than or equal to the threshold) and "Out of stock" (quantity at 0).</p>` },

    barre: { title: 'Stock bar and percentage', keys: 'bar percentage progress reference reference stock level 100',
      html: `<p>The bar shows the remaining quantity compared with a reference:</p>
<ul><li>if you entered a <b>reference stock</b> in the item sheet, it stands for 100%;</li>
<li>otherwise, the reference is the <b>highest level reached</b> by the item according to the history (or its current quantity if that is higher).</li></ul>
<p>Tip: enter a reference stock for each important item. Without it, the bar depends on the history: if you clear the history, the reference goes back to the current quantity.</p>` },

    conso: { title: 'Consumption estimate', keys: 'consumption average use per day week month year estimate autonomy duration frequency',
      html: `<p>In an item sheet, the <b>Average use</b> line looks like this: <b>[number] per [period]</b>.</p>
<ul><li>The first field is free: type a number (decimals are accepted, for example 0.5).</li>
<li>The second is a drop-down list: <b>day</b>, <b>week</b>, <b>month</b> or <b>year</b>.</li></ul>
<p>Examples: "3 per day", "1 per week", "2 per month", "4 per year".</p>
<p>If it is filled in, the card shows "Rough estimate: about N day(s) of stock" (remaining quantity divided by the consumption, rounded down). Leave the field empty if you do not want an estimate.</p>
<p>This estimate is only indicative: it does not take changes in your habits into account.</p>` },

    peremption: { title: 'Expiry date and lot number', keys: 'expiry expired expiration date lot soon 30 days',
      html: `<p>Enter the <b>expiry date</b> in the item sheet (and the <b>lot number</b> if you wish).</p>
<ul><li>Within 30 days of the date, the card shows "expires soon".</li>
<li>Once the date has passed, it shows "EXPIRED".</li>
<li>These items appear in the "Expiry" section of Home and in the "Expiring soon" filter of My stock.</li></ul>
<p>One date and one lot per sheet: if you have several lots, check the nearest date.</p>` },

    scanner: { title: 'Scanning a code', keys: 'scan scanning scanner camera barcode qr datamatrix gs1 photo gallery manual entry reading',
      html: `<p>In <b>Add > Scan an item</b>, point the rear camera at the code.</p>
<ul><li>Codes read: barcodes, QR codes and Datamatrix codes, including the dotted Datamatrix codes engraved on medicine boxes.</li>
<li>If the item already exists (same barcode), a window offers to directly <b>add</b> the quantity received.</li>
<li>Otherwise, a new item sheet opens with the code already filled in. For a GS1 Datamatrix, the lot and expiry date are suggested: <b>check them</b>.</li></ul>
<p>If live reading does not work:</p>
<ul><li>choose an <b>image of the code</b> (gallery or files): the app analyses the photo;</li>
<li>or use <b>manual code entry</b>, then "Confirm code".</li></ul>
<p>Tips: good light, a sharp and well-framed code, and no reflections on glossy boxes. The camera asks for permission the first time.</p>` },

    alarmes: { title: 'Alarms and reminders', keys: 'alarm alarms reminder reminders notification calendar ics repeat days time catheter sensor change',
      html: `<p>Alarms are for recurring reminders (changing a catheter, a sensor, a pen…). Access: <b>Home > My alarms</b>.</p>
<p>To create one: "New alarm", then</p>
<ul><li><b>Reminder name</b> (free text; suggestions are offered);</li>
<li><b>Time</b>;</li>
<li><b>Repeat every (days)</b>: a whole number from 1 to 365;</li>
<li><b>Date of the first alarm</b>.</li></ul>
<p>No frequency is imposed: choose the one that suits you.</p>
<p>For each alarm: the <b>On</b> checkbox pauses or reactivates it, "Edit" changes its settings, "Delete" removes it.</p>
<p><b>Important: when does the alarm ring?</b></p>
<ul><li>App <b>open</b> (or coming back to the foreground): a window appears, with a notification if you allowed it. If several reminders were missed, only the latest one is shown.</li>
<li>App <b>closed</b>: StockDiab cannot wake up the phone. Use "<b>Add to calendar</b>": a file is created, to open with the phone's Calendar app, which creates a recurring event with a reminder.</li></ul>` },

    ordonnances: { title: 'Prescriptions', keys: 'prescription prescriptions document photo pdf scan pages title date notes',
      html: `<p>Go to <b>My stock > My prescriptions > Scan a prescription</b>.</p>
<ul><li>Take a photo, or choose an existing image or PDF. You can add several pages.</li>
<li>Give it a title, a date and notes if you wish.</li>
<li>On the card: "View", "Edit" or "Delete".</li></ul>
<p>Images are reduced (1800 pixels maximum) and stay on the phone. There is no automatic cropping and no text recognition. They are not encrypted: turn on your screen lock. Prescriptions are included in the backup, which becomes larger.</p>` },

    historique: { title: 'History and clearing it', keys: 'history movements in out correction filter clear erase delete log',
      html: `<p>The <b>History</b> tab lists all movements, from the most recent to the oldest: type (In, Out or Correction), quantity, stock before and after, date, time and note.</p>
<p>Filters: by <b>item</b> and by movement <b>type</b>.</p>
<p><b>Clear history</b>: the button of the same name deletes only the movements, after confirmation. Your items, quantities, prescriptions and alarms are kept. This cannot be undone: make a backup first if needed.</p>
<p>Consequence: for items without a "reference stock", the stock bar starts again from the current quantity.</p>
<p>If you delete an item, its history is kept.</p>` },

    parametres: { title: 'Settings', keys: 'settings options language theme dark light automatic about support coffee guide',
      html: `<p>The <b>Settings</b> tab contains:</p>
<ul><li><b>Language</b>: French, English or Spanish.</li>
<li><b>Theme</b>: automatic (follows the phone setting), light or dark.</li>
<li><b>User guide</b>: this page.</li>
<li><b>Backup</b>: export, restore, erase all data (see the next chapter).</li>
<li><b>About</b>: presentation, legal notice, personal data, liability.</li>
<li><b>Support the project</b>: the "Buy me a coffee" link, opened only if you tap it.</li></ul>
<p>Language and theme are remembered on the device.</p>` },

    sauvegarde: { title: 'Backup and restore', keys: 'backup back up export import restore json file data loss erase all data',
      html: `<p>Your data exists only on this phone. Clearing the browser data, uninstalling the app or losing the phone erases it for good: <b>export regularly</b>.</p>
<ul><li><b>Export (JSON)</b>: downloads a dated file containing items, history, alarms and prescriptions. Keep it somewhere safe (it contains your prescriptions).</li>
<li><b>Restore…</b>: choose an exported file. The app shows what it contains and asks for confirmation, because it <b>replaces all current data</b>.</li>
<li><b>Erase all data</b>: deletes everything (items, history, prescriptions), after confirmation. This cannot be undone.</li></ul>
<p>To change phones: export on the old one, install the app on the new one, then restore the file.</p>` },

    installation: { title: 'Installation and updates', keys: 'install installation home screen android iphone ios chrome safari offline update app',
      html: `<ul><li><b>Android (Chrome)</b>: menu (three dots) > "Install app" or "Add to Home screen".</li>
<li><b>iPhone (Safari)</b>: Share button > "Add to Home Screen".</li></ul>
<p>Once installed, the app works without a connection. It updates itself when a connection is available (the page reloads once), without ever touching your data.</p>` },

    depannage: { title: 'Troubleshooting (FAQ)', keys: 'problem help troubleshooting error not working camera alarm lost data faq stuck',
      html: `<p><b>The camera does not open.</b> Allow the camera for StockDiab in the phone or browser settings. In the meantime, use a photo of the code or manual entry.</p>
<p><b>The code is not recognised.</b> Move closer, improve the light, avoid reflections, or take a sharp photo.</p>
<p><b>My alarm did not ring.</b> This is normal if the app was closed: use "Add to calendar" (Alarms chapter). Also check that the "On" box is ticked.</p>
<p><b>"This barcode already exists".</b> Another item uses this code: edit it or open the existing item.</p>
<p><b>"Cannot remove: only N left in stock".</b> You are trying to remove more than what is available. If the real stock is different, correct the quantity in the item sheet.</p>
<p><b>The "Remove 1" button is greyed out.</b> The item's quantity is 0.</p>
<p><b>My data has disappeared.</b> It was erased along with the browser data or by uninstalling: restore your latest backup (Settings > Restore…).</p>
<p><b>The stock bar shows 100% although I have used some.</b> Enter a "reference stock" in the item sheet.</p>
<p>Another question? Write to the address shown in "About".</p>` },

    securite: { title: 'Safety and limits', keys: 'safety security privacy data medical device health doctor liability encryption lock',
      html: `<p><b>StockDiab is not a medical device.</b> It calculates no dose and does not replace the advice of your doctor or care team.</p>
<ul><li>Check your quantities, lots and expiry dates yourself: estimates are only indicative.</li>
<li>No data is sent to a server; no account, no tracking, no ads.</li>
<li>Data is not encrypted on the phone: protect it with a screen lock.</li>
<li>Export a backup regularly.</li></ul>` },
  },

  es: {
    demarrer: { title: 'Primeros pasos', keys: 'presentación navegación pestañas inicio empezar descubrir',
      html: `<p>StockDiab sirve para llevar el control de su material (insulina, sensores, catéteres, tiras reactivas, pilas…) y saber cuándo reponerlo. Todo se guarda solo en su teléfono: sin cuenta y sin servidor.</p>
<p>La barra inferior tiene cinco pestañas:</p>
<ul><li><b>Inicio</b>: el número de referencias, de artículos bajo el umbral y de artículos agotados, la lista «Por reponer», las caducidades próximas y el botón «Mis alarmas».</li>
<li><b>Mi stock</b>: todos sus artículos (pestaña «Material») y sus recetas (pestaña «Mis recetas»).</li>
<li><b>Añadir</b>: escanear un artículo o crear una ficha manualmente.</li>
<li><b>Historial</b>: todos los movimientos de stock.</li>
<li><b>Ajustes</b>: idioma, tema, copia de seguridad, guía de uso, acerca de.</li></ul>
<p>Para empezar: abra «Añadir», cree sus primeros artículos y después ajuste el umbral de alerta de cada uno.</p>` },

    ajout: { title: 'Añadir un artículo', keys: 'añadir agregar crear nueva ficha artículo manualmente escanear unidad cantidad inicial umbral código de barras lote caducidad notas categoría',
      html: `<p>En la pestaña <b>Añadir</b> hay dos posibilidades:</p>
<ul><li><b>Escanear un artículo</b>: la cámara lee el código de la caja (véase el capítulo «Escanear un código»).</li>
<li><b>Crear una ficha manualmente</b>: se abre un formulario.</li></ul>
<p>Campos de la ficha:</p>
<ul><li><b>Nombre del producto</b> (obligatorio) y <b>Categoría</b> (opcional, útil para buscar).</li>
<li><b>Unidad de conteo</b>: pieza, caja, pluma, vial, cartucho, catéter, reservorio, sensor, pila, tira reactiva, o la unidad que prefiera.</li>
<li><b>Cantidad inicial</b>: un número entero. Si es superior a 0, se añade un movimiento «Entrada» («Ficha creada») al historial.</li>
<li><b>Umbral de alerta</b>: el artículo pasa a «Stock bajo» cuando la cantidad es menor o igual que el umbral (1 por defecto).</li>
<li><b>Código de barras</b> (opcional): dos artículos no pueden tener el mismo código.</li>
<li><b>Fecha de caducidad</b> y <b>Número de lote</b> (opcionales).</li>
<li><b>Stock de referencia</b> (opcional): la cantidad que equivale al 100 % de la barra de stock.</li>
<li><b>Consumo medio</b> (opcional): véase el capítulo «Estimación de consumo».</li>
<li><b>Notas</b>: texto libre, 500 caracteres como máximo.</li></ul>
<p>Puede modificar una ficha más tarde con el botón «Ficha» del artículo.</p>` },

    stock: { title: 'Gestionar su stock en el día a día', keys: 'mi stock retirar añadir retirada entrada salida corrección cantidad búsqueda filtro tarjeta contraer desplegar botón',
      html: `<p>En <b>Mi stock</b>, cada artículo es una tarjeta con cuatro botones:</p>
<ul><li><b>Retirar 1</b>: retira una unidad tras confirmar (aparece atenuado cuando el stock es 0).</li>
<li><b>Retirar…</b>: retira la cantidad que usted elija, con una nota opcional. No es posible retirar más de lo que queda.</li>
<li><b>Añadir</b>: añade la cantidad recibida (reposición), con una nota opcional.</li>
<li><b>Ficha</b>: abre la ficha para modificarla o eliminar el artículo.</li></ul>
<p>Todas las retiradas son manuales: la aplicación no calcula ninguna dosis y nunca retira nada por sí sola.</p>
<p>Si el número mostrado es incorrecto, modifique la cantidad en la ficha: la diferencia se registra como «Corrección» en el historial.</p>
<p><b>Buscar y filtrar</b>: el campo de búsqueda busca en el nombre, la categoría y el código de barras. Los filtros son «Todos», «Stock bajo», «Agotados» y «Caducidad próxima».</p>
<p><b>Contraer una tarjeta</b>: toque el nombre del producto (flecha ▾) para conservar solo el nombre, la cantidad y la barra de stock. Tóquelo de nuevo para reabrir la tarjeta. El botón «Contraer todo» / «Desplegar todo» actúa sobre todas las tarjetas mostradas. Su elección se guarda en el dispositivo.</p>
<p><b>Los tres estados de un artículo</b>: «Stock suficiente» (cantidad por encima del umbral), «Stock bajo» (cantidad menor o igual que el umbral) y «Agotado» (cantidad a 0).</p>` },

    barre: { title: 'Barra de stock y porcentaje', keys: 'barra porcentaje progreso referencia stock de referencia nivel 100',
      html: `<p>La barra indica la cantidad restante en relación con una referencia:</p>
<ul><li>si ha indicado un <b>stock de referencia</b> en la ficha, este representa el 100 %;</li>
<li>si no, la referencia es el <b>nivel más alto alcanzado</b> por el artículo según el historial (o su cantidad actual si es mayor).</li></ul>
<p>Consejo: indique un stock de referencia para cada artículo importante. Sin él, la barra depende del historial: si borra el historial, la referencia vuelve a ser la cantidad actual.</p>` },

    conso: { title: 'Estimación de consumo', keys: 'consumo medio por día semana mes año estimación duración autonomía frecuencia',
      html: `<p>En la ficha de un artículo, la línea <b>Consumo medio</b> se presenta así: <b>[número] por [período]</b>.</p>
<ul><li>El primer campo es libre: escriba un número (se aceptan decimales, por ejemplo 0,5).</li>
<li>El segundo es una lista desplegable: <b>día</b>, <b>semana</b>, <b>mes</b> o <b>año</b>.</li></ul>
<p>Ejemplos: «3 por día», «1 por semana», «2 por mes», «4 por año».</p>
<p>Si se rellena, la tarjeta muestra «Estimación orientativa: unos N día(s) de stock» (cantidad restante dividida entre el consumo, redondeada hacia abajo). Deje el campo vacío si no desea estimación.</p>
<p>Esta estimación es solo orientativa: no tiene en cuenta los cambios de hábitos.</p>` },

    peremption: { title: 'Caducidad y número de lote', keys: 'caducidad caducado fecha vencimiento lote pronto 30 días',
      html: `<p>Indique la <b>fecha de caducidad</b> en la ficha (y el <b>lote</b> si lo desea).</p>
<ul><li>A menos de 30 días de la fecha, la tarjeta indica «caduca pronto».</li>
<li>Una vez superada la fecha, indica «CADUCADO».</li>
<li>Estos artículos aparecen en la sección «Caducidad» de Inicio y en el filtro «Caducidad próxima» de Mi stock.</li></ul>
<p>Una sola fecha y un solo lote por ficha: si tiene varios lotes, controle la fecha más próxima.</p>` },

    scanner: { title: 'Escanear un código', keys: 'escanear escaneo escáner escaner cámara código de barras qr datamatrix gs1 foto galería entrada manual lectura',
      html: `<p>En <b>Añadir > Escanear un artículo</b>, apunte la cámara trasera hacia el código.</p>
<ul><li>Códigos leídos: códigos de barras, códigos QR y Datamatrix, incluidos los Datamatrix punteados grabados en las cajas de medicamentos.</li>
<li>Si el artículo ya existe (mismo código de barras), una ventana le propone <b>añadir</b> directamente la cantidad recibida.</li>
<li>Si no, se abre una ficha nueva con el código ya rellenado. En un Datamatrix GS1 se proponen el lote y la caducidad: <b>compruébelos</b>.</li></ul>
<p>Si la lectura en directo no funciona:</p>
<ul><li>elija una <b>imagen del código</b> (galería o archivos): la aplicación analiza la foto;</li>
<li>o use la <b>introducción manual del código</b> y después «Confirmar código».</li></ul>
<p>Consejos: buena luz, código nítido y bien encuadrado, y evitar reflejos en las cajas brillantes. La cámara pide permiso la primera vez.</p>` },

    alarmes: { title: 'Alarmas y recordatorios', keys: 'alarma alarmas recordatorio recordatorios notificación calendario ics repetir días hora catéter sensor cambio',
      html: `<p>Las alarmas sirven para los recordatorios periódicos (cambio de catéter, de sensor, de pluma…). Acceso: <b>Inicio > Mis alarmas</b>.</p>
<p>Para crear una: «Nueva alarma» y después</p>
<ul><li><b>Nombre del recordatorio</b> (libre; se ofrecen sugerencias);</li>
<li><b>Hora</b>;</li>
<li><b>Repetir cada (días)</b>: un número entero de 1 a 365;</li>
<li><b>Fecha de la primera alarma</b>.</li></ul>
<p>No se impone ninguna frecuencia: elija la que le convenga.</p>
<p>Para cada alarma: la casilla <b>Activa</b> la pausa o la reactiva, «Editar» cambia sus ajustes y «Eliminar» la borra.</p>
<p><b>Importante: ¿cuándo suena la alarma?</b></p>
<ul><li>Aplicación <b>abierta</b> (o que vuelve a primer plano): aparece una ventana, con una notificación si la ha permitido. Si se han perdido varios recordatorios, solo se muestra el último.</li>
<li>Aplicación <b>cerrada</b>: StockDiab no puede despertar el teléfono. Use «<b>Añadir al calendario</b>»: se crea un archivo que se abre con la aplicación Calendario del teléfono, que crea un evento periódico con aviso.</li></ul>` },

    ordonnances: { title: 'Recetas', keys: 'receta recetas documento foto pdf escanear páginas título fecha notas',
      html: `<p>Vaya a <b>Mi stock > Mis recetas > Escanear una receta</b>.</p>
<ul><li>Haga una foto o elija una imagen o un PDF existente. Puede añadir varias páginas.</li>
<li>Póngale un título, una fecha y notas si lo desea.</li>
<li>En la tarjeta: «Ver», «Editar» o «Eliminar».</li></ul>
<p>Las imágenes se reducen (1800 píxeles como máximo) y permanecen en el teléfono. No hay recorte automático ni reconocimiento de texto. No están cifradas: active el bloqueo de pantalla. Las recetas se incluyen en la copia de seguridad, que pasa a ser más voluminosa.</p>` },

    historique: { title: 'Historial y cómo borrarlo', keys: 'historial movimientos entrada salida corrección filtro borrar eliminar registro',
      html: `<p>La pestaña <b>Historial</b> muestra todos los movimientos, del más reciente al más antiguo: tipo (Entrada, Salida o Corrección), cantidad, stock antes y después, fecha, hora y nota.</p>
<p>Filtros: por <b>artículo</b> y por <b>tipo</b> de movimiento.</p>
<p><b>Borrar el historial</b>: el botón del mismo nombre elimina solo los movimientos, tras confirmar. Sus artículos, cantidades, recetas y alarmas se conservan. La acción no se puede deshacer: haga antes una copia de seguridad si lo necesita.</p>
<p>Consecuencia: en los artículos sin «stock de referencia», la barra de stock vuelve a partir de la cantidad actual.</p>
<p>Si elimina un artículo, su historial se conserva.</p>` },

    parametres: { title: 'Ajustes', keys: 'ajustes configuración opciones idioma tema oscuro claro automático acerca de apoyar café guía',
      html: `<p>La pestaña <b>Ajustes</b> contiene:</p>
<ul><li><b>Idioma</b>: francés, inglés o español.</li>
<li><b>Tema</b>: automático (sigue el ajuste del teléfono), claro u oscuro.</li>
<li><b>Guía de uso</b>: esta página.</li>
<li><b>Copia de seguridad</b>: exportar, restaurar, borrar todos los datos (véase el capítulo siguiente).</li>
<li><b>Acerca de</b>: presentación, aviso legal, datos personales, responsabilidad.</li>
<li><b>Apoya el proyecto</b>: el enlace «Buy me a coffee», que solo se abre si lo toca.</li></ul>
<p>El idioma y el tema se guardan en el dispositivo.</p>` },

    sauvegarde: { title: 'Copia de seguridad y restauración', keys: 'copia de seguridad respaldo exportar importar restaurar json archivo datos pérdida borrar todos los datos',
      html: `<p>Sus datos solo existen en este teléfono. Borrar los datos del navegador, desinstalar la aplicación o perder el teléfono los elimina definitivamente: <b>exporte con regularidad</b>.</p>
<ul><li><b>Exportar (JSON)</b>: descarga un archivo con fecha que contiene artículos, historial, alarmas y recetas. Guárdelo en un lugar seguro (contiene sus recetas).</li>
<li><b>Restaurar…</b>: elija un archivo exportado. La aplicación indica lo que contiene y pide confirmación, porque <b>reemplaza todos los datos actuales</b>.</li>
<li><b>Borrar todos los datos</b>: elimina todo (artículos, historial, recetas), tras confirmar. No se puede deshacer.</li></ul>
<p>Para cambiar de teléfono: exporte en el antiguo, instale la aplicación en el nuevo y restaure el archivo.</p>` },

    installation: { title: 'Instalación y actualizaciones', keys: 'instalar instalación pantalla de inicio android iphone ios chrome safari sin conexión actualización aplicación',
      html: `<ul><li><b>Android (Chrome)</b>: menú (tres puntos) > «Instalar aplicación» o «Añadir a la pantalla de inicio».</li>
<li><b>iPhone (Safari)</b>: botón Compartir > «Añadir a pantalla de inicio».</li></ul>
<p>Una vez instalada, la aplicación funciona sin conexión. Se actualiza sola cuando hay conexión (la página se recarga una vez), sin tocar nunca sus datos.</p>` },

    depannage: { title: 'Solución de problemas (preguntas frecuentes)', keys: 'problema ayuda error no funciona cámara alarma desaparecido faq bloqueado',
      html: `<p><b>La cámara no se abre.</b> Permita la cámara para StockDiab en los ajustes del teléfono o del navegador. Mientras tanto, use la foto de un código o la introducción manual.</p>
<p><b>No se reconoce el código.</b> Acérquese, mejore la luz, evite los reflejos o haga una foto nítida.</p>
<p><b>Mi alarma no ha sonado.</b> Es normal si la aplicación estaba cerrada: use «Añadir al calendario» (capítulo Alarmas). Compruebe también que la casilla «Activa» está marcada.</p>
<p><b>«Este código de barras ya existe».</b> Otro artículo usa ese código: modifíquelo o abra el artículo existente.</p>
<p><b>«No se puede retirar: solo quedan N en stock».</b> Está intentando retirar más de lo disponible. Si el stock real es distinto, corrija la cantidad en la ficha.</p>
<p><b>El botón «Retirar 1» está atenuado.</b> La cantidad del artículo es 0.</p>
<p><b>Mis datos han desaparecido.</b> Se borraron junto con los datos del navegador o al desinstalar la aplicación: restaure su última copia de seguridad (Ajustes > Restaurar…).</p>
<p><b>La barra de stock muestra 100 % aunque he consumido.</b> Indique un «stock de referencia» en la ficha del artículo.</p>
<p>¿Otra pregunta? Escriba a la dirección indicada en «Acerca de».</p>` },

    securite: { title: 'Seguridad y límites', keys: 'seguridad confidencialidad datos médico producto sanitario salud médico responsabilidad cifrado bloqueo',
      html: `<p><b>StockDiab no es un producto sanitario.</b> No calcula ninguna dosis y no sustituye el consejo de su médico o de su equipo médico.</p>
<ul><li>Compruebe usted mismo sus cantidades, lotes y fechas de caducidad: las estimaciones son solo orientativas.</li>
<li>No se envía ningún dato a un servidor; sin cuenta, sin seguimiento, sin publicidad.</li>
<li>Los datos no están cifrados en el teléfono: protéjalo con un bloqueo de pantalla.</li>
<li>Exporte una copia de seguridad con regularidad.</li></ul>` },
  },
};
