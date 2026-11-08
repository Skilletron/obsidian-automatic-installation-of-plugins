import type { LocaleMessages } from "../index";

export const es: LocaleMessages = {
	// Commands
	"cmd.export": "Exportar configuración de complementos a JSON",
	"cmd.preview": "Previsualizar importación de configuración de complementos",
	"cmd.import": "Importar configuración de complementos desde JSON",
	"cmd.apply": "Aplicar ajustes desde JSON",
	"cmd.exportPack": "Exportar paquete de configuración para compartir",
	"cmd.importPack": "Importar paquete de configuración desde un enlace",
	"cmd.checkUpdates": "Buscar actualizaciones de complementos",
	"cmd.undo": "Deshacer la última importación, exportación o cambio de ajustes",

	// Shared
	"common.unknownError": "Error desconocido",
	"common.close": "Cerrar",
	"common.cancel": "Cancelar",
	"common.busy":
		"Ya hay otra importación, exportación o actualización de ajustes en curso.",
	"common.startupFailed":
		"Falló la instalación al iniciar. Consulta la consola para más detalles.",
	"common.and": " y ",
	"device.desktop": "escritorio",
	"device.mobile": "móvil",
	"progress.step": "{current} de {total} · {detail}",
	"net.rateLimit":
		"Se alcanzó el límite de solicitudes de GitHub o se denegó el acceso. Espera unos minutos e inténtalo de nuevo.",

	// Import
	"import.title": "Importando configuración de complementos",
	"import.finished": "Importación completada",
	"import.finishedProblems": "Importación completada con problemas",
	"import.failed": "Falló la importación",
	"import.createdEmpty":
		"Se creó un {file} vacío. Añade los ID de los complementos e importa de nuevo.",
	"import.cannotCreate":
		"No se puede crear {file}. Comprueba los permisos del archivo.",
	"import.empty":
		"{file} está vacío. Añade los ID de los complementos e importa de nuevo.",
	"import.invalidJson": "JSON no válido en {file}: {error}.",
	"import.noPlugins": "No hay complementos que instalar.",
	"import.notForMobile":
		"Ningún complemento de la lista está pensado para este dispositivo móvil.",
	"import.notForDesktop":
		"Ningún complemento de la lista está pensado para este equipo de escritorio.",
	"import.installing": "Instalando {label}",
	"import.turningOn": "Activando {id}",
	"import.couldNotEnable": "No se pudieron activar: {ids}.",
	"import.autoEnableOff":
		"La activación automática está desactivada, así que los complementos nuevos quedan desactivados.",
	"import.skippedDesktopOnly": {
		one: "Se omitió {count} complemento solo para escritorio en este dispositivo.",
		many: "Se omitieron {count} complementos solo para escritorio en este dispositivo.",
		other: "Se omitieron {count} complementos solo para escritorio en este dispositivo.",
	},
	"import.otherDevices": {
		one: "{count} complemento está indicado solo para otros dispositivos.",
		many: "{count} complementos están indicados solo para otros dispositivos.",
		other: "{count} complementos están indicados solo para otros dispositivos.",
	},
	"import.keptOff": "Complementos que quedan desactivados según la lista: {count}.",
	"import.changed": {
		one: "Se instaló o actualizó {count} complemento",
		many: "Se instalaron o actualizaron {count} complementos",
		other: "Se instalaron o actualizaron {count} complementos",
	},
	"import.upToDate": "Todo estaba ya actualizado",
	"import.summary": "{summary} ({ok} de {total} correctos).",
	"import.error": "{error}. Consulta la consola para más detalles.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} no es válido, así que se omitió.",
	"vaultSetup.applying":
		"Aplicando ajustes de Obsidian, tema, fragmentos, atajos de teclado y complementos principales",
	"vaultSetup.snippetsWritten": {
		one: "Se añadió o actualizó {count} fragmento CSS.",
		many: "Se añadieron o actualizaron {count} fragmentos CSS.",
		other: "Se añadieron o actualizaron {count} fragmentos CSS.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Se asignaron atajos de teclado a {count} comando.",
		many: "Se asignaron atajos de teclado a {count} comandos.",
		other: "Se asignaron atajos de teclado a {count} comandos.",
	},
	"vaultSetup.corePlugins":
		"Complementos principales: activados {on}, desactivados {off}.",
	"vaultSetup.themeDefault": "Se cambió al tema predeterminado",
	"vaultSetup.themeInstalled": "Tema {name} {version} instalado",
	"vaultSetup.themeSwitched": "Se cambió al tema {name}",
	"vaultSetup.noHotkeyManager":
		"El gestor de atajos de teclado de Obsidian no está disponible.",
	"vaultSetup.noCoreManager":
		"El gestor de complementos principales de Obsidian no está disponible.",
	"vaultSetup.noThemeManager": "El gestor de temas de Obsidian no está disponible.",
	"vaultSetup.snippetFailed": 'No se pudo escribir el fragmento "{name}".',
	"vaultSetup.themeFailed": 'No se pudo instalar el tema "{name}".',
	"vaultSetup.defaultThemeLabel": "el tema predeterminado",
	"vaultSetup.describeThemeSame": "Tema: ya se usa {label}",
	"vaultSetup.describeThemeSwitch": "Tema: se cambiaría a {label}",
	"vaultSetup.describeSnippets":
		"Fragmentos: {total} ({added} nuevos, {changed} modificados, {unchanged} sin cambios)",
	"vaultSetup.describeHotkeys":
		"Atajos de teclado: {total} comandos ({changed} cambiarían)",
	"vaultSetup.describeCore":
		"Complementos principales: se activarían {on}, se desactivarían {off}",
	"vaultSetup.describeCoreSame":
		"Complementos principales: ya coinciden con la lista",
	"vaultSetup.appSettingsSet":
		"Ajustes de Obsidian cambiados: {count}. Algunos se aplican al volver a abrir Obsidian.",
	"vaultSetup.coreSettingsSet": "Ajustes de complementos principales cambiados: {count}.",
	"vaultSetup.bookmarksAdded": "Marcadores añadidos: {count}.",
	"vaultSetup.noConfigManager": "El gestor de ajustes de Obsidian no está disponible.",
	"vaultSetup.coreSettingsFailed":
		"No se pudieron escribir los ajustes del complemento principal «{id}».",
	"vaultSetup.bookmarksFailed": "No se pudieron escribir los marcadores.",
	"vaultSetup.describeApp":
		"Ajustes de Obsidian: {total} en la lista (cambiarían {changed})",
	"vaultSetup.describeCoreSettings":
		"Ajustes de complementos principales: {total} complementos (cambiarían {changed})",
	"vaultSetup.describeBookmarks":
		"Marcadores: {total} en la lista (se añadirían {added})",

	// Export
	"export.finished": "Exportación completada",
	"export.failed": "Falló la exportación",
	"export.saved": {
		one: "Se guardó {count} complemento ({pinned} con versión fijada, {withSettings} con ajustes) en {listFile} y {settingsFile}.",
		many: "Se guardaron {count} complementos ({pinned} con versión fijada, {withSettings} con ajustes) en {listFile} y {settingsFile}.",
		other: "Se guardaron {count} complementos ({pinned} con versión fijada, {withSettings} con ajustes) en {listFile} y {settingsFile}.",
	},
	"export.kept": {
		one: " Se conservó {count} entrada de complementos no instalados en este dispositivo.",
		many: " Se conservaron {count} entradas de complementos no instalados en este dispositivo.",
		other: " Se conservaron {count} entradas de complementos no instalados en este dispositivo.",
	},
	"export.redacted": {
		one: " Se omitió {count} valor secreto (tokens, contraseñas).",
		many: " Se omitieron {count} valores secretos (tokens, contraseñas).",
		other: " Se omitieron {count} valores secretos (tokens, contraseñas).",
	},
	"export.snippets": {
		one: "{count} fragmento CSS",
		many: "{count} fragmentos CSS",
		other: "{count} fragmentos CSS",
	},
	"export.hotkeys": {
		one: "{count} atajo de teclado personalizado",
		many: "{count} atajos de teclado personalizados",
		other: "{count} atajos de teclado personalizados",
	},
	"export.vaultSetup":
		" También se guardaron {theme}, {snippets}, {hotkeys}, tus complementos principales, los ajustes de Obsidian y los marcadores en {file}.",
	"export.writeFailed": "no se pudieron escribir los archivos JSON de configuración",

	// Setup packs
	"pack.name": "Configuración de {vault}",
	"pack.savedTitle": "Paquete de configuración guardado",
	"pack.savedSecrets": {
		one: " Se omitió {count} valor secreto.",
		many: " Se omitieron {count} valores secretos.",
		other: " Se omitieron {count} valores secretos.",
	},
	"pack.savedBody": {
		one: "{file} en tu bóveda tiene {count} complemento.{secrets} Compártelo (por ejemplo, como un gist de GitHub) y otros podrán usar Importar paquete de configuración desde un enlace.",
		many: "{file} en tu bóveda tiene {count} complementos.{secrets} Compártelo (por ejemplo, como un gist de GitHub) y otros podrán usar Importar paquete de configuración desde un enlace.",
		other: "{file} en tu bóveda tiene {count} complementos.{secrets} Compártelo (por ejemplo, como un gist de GitHub) y otros podrán usar Importar paquete de configuración desde un enlace.",
	},
	"pack.notSavedTitle": "Paquete de configuración no guardado",
	"pack.writeFailed": "no se pudo escribir {file}",
	"pack.loadFailedTitle": "No se pudo cargar el paquete de configuración",
	"pack.httpsOnly": "solo se pueden cargar enlaces https",
	"pack.notFound": "{path} no se encontró en esta bóveda",
	"pack.notPackTitle": "No es un paquete de configuración",
	"pack.notPackBody":
		"El archivo no es un paquete de configuración creado con Exportar paquete de configuración para compartir.",
	"pack.notAddedTitle": "Paquete de configuración no añadido",
	"pack.linkTitle": "Importar un paquete de configuración",
	"pack.linkDesc":
		"Pega un enlace web a un paquete de configuración (también sirve un gist de GitHub o un archivo en GitHub) o la ruta de un archivo de paquete en esta bóveda. No se instala nada hasta que confirmes en la siguiente pantalla.",
	"pack.linkName": "Enlace o ruta",
	"pack.linkPlaceholder": "Enlace o ruta en la bóveda",
	"pack.load": "Cargar",
	"pack.defaultName": "Paquete de configuración",
	"pack.from": "Origen: {source}",
	"pack.warning":
		"Los complementos de la comunidad pueden leer y modificar tus notas. Continúa solo si confías en quien creó este paquete.",
	"pack.pluginCount": {
		one: "{count} complemento ({withSettings} con ajustes)",
		many: "{count} complementos ({withSettings} con ajustes)",
		other: "{count} complementos ({withSettings} con ajustes)",
	},
	"pack.devicesOnly": " (solo {devices})",
	"pack.staysOff": " (queda desactivado)",
	"pack.hasSettings": " · ajustes",
	"pack.explain":
		"El paquete se añade a tu propia lista de complementos y a tus archivos de ajustes (tiene prioridad donde ambos definen algo) y luego se ejecuta la importación. Deshacer el último cambio restaura los archivos.",
	"pack.confirm": "Añadir a mi configuración e importar",
	"pack.pickTitle": "Elegir los plugins del paquete",
	"pack.pickDesc":
		"Desactiva lo que no quieras compartir. Los ajustes de los demás plugins se incluyen sin los secretos.",
	"pack.pickAll": "Seleccionar todos",
	"pack.pickNone": "No seleccionar ninguno",
	"pack.pickOff": "desactivado",
	"pack.pickSave": "Guardar paquete ({count})",
	"pack.pickEmpty": "No hay plugins de la comunidad instalados.",

	// Updates
	"updates.checking": "Buscando actualizaciones de complementos",
	"updates.checkFinished": "Búsqueda de actualizaciones completada",
	"updates.found": {
		one: "{count} complemento tiene una actualización.",
		many: "{count} complementos tienen actualizaciones.",
		other: "{count} complementos tienen actualizaciones.",
	},
	"updates.none": "Todos los complementos de la comunidad están actualizados.",
	"updates.checkFailed": "Falló la búsqueda de actualizaciones",
	"updates.updating": "Actualizando complementos",
	"updates.step": "Actualizando {id} a {version}",
	"updates.updated": {
		one: "Actualizado: {done} de {count} complemento.",
		many: "Actualizados: {done} de {count} complementos.",
		other: "Actualizados: {done} de {count} complementos.",
	},
	"updates.pinsMoved": {
		one: "Se actualizó {count} versión fijada en {file}.",
		many: "Se actualizaron {count} versiones fijadas en {file}.",
		other: "Se actualizaron {count} versiones fijadas en {file}.",
	},
	"updates.finished": "Actualización completada",
	"updates.finishedProblems": "Actualización completada con problemas",
	"updates.failed": "Falló la actualización",
	"updates.modalTitle": "Actualizaciones de complementos",
	"updates.update": "Actualizar",
	"updates.updateAll": "Actualizar todo ({count})",
	"updates.installed": "Instalada: {version}",
	"updates.needsApp": "{version} requiere Obsidian {minApp}",
	"updates.pinToo":
		"la versión fijada en tu lista de complementos ({version}) también se actualizará",

	// Undo
	"undo.nothingTitle": "Nada que deshacer",
	"undo.nothingBody":
		"No hay ninguna acción anterior de Importar, Aplicar ajustes o Exportar que deshacer.",
	"undo.incompleteTitle": "Deshacer incompleto",
	"undo.incompleteBody":
		"Se restauraron {restored} de {total} archivos. Se conserva la copia de seguridad; consulta la consola para más detalles.",
	"undo.doneTitle": "Se deshizo: {reason}",
	"undo.doneBody": {
		one: "Del {date}: se restauró {count} archivo.{reload}",
		many: "Del {date}: se restauraron {count} archivos.{reload}",
		other: "Del {date}: se restauraron {count} archivos.{reload}",
	},
	"undo.reload": " Los complementos se recargarán al cerrar los Ajustes.",
	"undo.failed": "No se pudo deshacer",
	"reason.import": "importación",
	"reason.export": "exportación",
	"reason.apply": "aplicar ajustes",
	"reason.update": "actualizar complementos",
	"reason.pack": "importar paquete de configuración",
	"reason.settings": "cambio de ajustes",

	// Apply settings
	"apply.title": "Aplicando ajustes de complementos",
	"apply.none": "No se escribió ningún ajuste.",
	"apply.done": "Ajustes aplicados",
	"apply.plugins": {
		one: "{count} complemento",
		many: "{count} complementos",
		other: "{count} complementos",
	},
	"apply.deferred": {
		one: "Actualizados: {plugins}. {count} complemento en ejecución se recargará al cerrar los Ajustes.",
		many: "Actualizados: {plugins}. {count} complementos en ejecución se recargarán al cerrar los Ajustes.",
		other: "Actualizados: {plugins}. {count} complementos en ejecución se recargarán al cerrar los Ajustes.",
	},
	"apply.restarted": "Actualizados: {plugins} ({restarted} recargados).",
	"apply.updated": "Actualizados: {plugins}.",
	"apply.failed": "Falló la aplicación de ajustes",
	"apply.fsError": "No se puede acceder al sistema de archivos: {error}",
	"apply.noSettingsFile":
		"No se encontró el archivo {file}; no se aplican ajustes.",
	"apply.cannotWrite":
		"No se pueden escribir los ajustes del complemento {id}. Comprueba los permisos del archivo.",
	"apply.writeFailed":
		"No se pudo escribir data.json del complemento {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "ID de complemento no válido.",
	"install.invalidIdNamed": 'ID de complemento no válido: "{id}".',
	"install.noApi":
		"La API installPlugin de Obsidian no está disponible. Actualiza Obsidian e inténtalo de nuevo.",
	"install.notInRegistry":
		'No se encontró el complemento "{id}" en el registro de complementos de la comunidad de Obsidian.',
	"install.badRepoInfo":
		'El complemento "{id}" tiene información de repositorio no válida en el registro.',
	"install.badRepoFormat":
		'El complemento "{id}" tiene un formato de repositorio no válido: {repo}',
	"install.noPinnedManifest":
		'No se pudo obtener el manifiesto de "{id}" {version}. Puede que GitHub esté limitando las solicitudes.',
	"install.noRelease":
		'No se encontró una versión adecuada para el complemento "{id}".',
	"install.badManifest": 'manifest.json no válido para "{id}".',
	"install.failed": 'No se pudo instalar el complemento "{id}": {error}',
	"enable.noApi":
		"No se puede acceder a la API de complementos. Habrá que activar los complementos manualmente.",

	// Files and the plugin list
	"file.readFailed": "No se pudo leer el archivo: {error}",
	"file.writeFailed": "No se pudo escribir el archivo: {error}",
	"file.empty":
		"{file} está vacío. Añade contenido o el archivo se volverá a crear.",
	"file.invalidJson":
		"JSON no válido en {file}: {error}. Comprueba el formato del archivo.",
	"list.notArray":
		"{file} debe contener una lista de ID de complementos u objetos { id, version }.",
	"list.skipped": {
		one: "Se omitió {count} entrada no válida en {file}. Consulta la consola.",
		many: "Se omitieron {count} entradas no válidas en {file}. Consulta la consola.",
		other: "Se omitieron {count} entradas no válidas en {file}. Consulta la consola.",
	},

	// Import preview
	"preview.title": "Vista previa de la importación",
	"preview.failed": "Falló la vista previa: {error}",
	"preview.listNotFound": "Vista previa: no se encontró {file}.",
	"preview.listInvalidJson": "Vista previa: JSON no válido en {file}.",
	"preview.otherDevice":
		"Indicado solo para {devices}; se omite en este dispositivo",
	"preview.notOnDevice": "No se aplica en este dispositivo",
	"preview.installPinned": "Se instalaría @{version}",
	"preview.installLatest": "Se instalaría (última versión estable)",
	"preview.leftOff": ", quedaría desactivado",
	"preview.alreadyPinned": "Ya está en la versión fijada {version}",
	"preview.wouldChange": "Cambiaría {from} → {to}",
	"preview.unknownVersion": "desconocida",
	"preview.installedSkip": "Ya instalado @{version} (sin fijar, se omite)",
	"preview.installedSkipNoVersion": "Ya instalado (sin fijar, se omite)",
	"preview.settingsMissing": "Falta {file}",
	"preview.noEntry": "Sin entrada de ajustes",
	"preview.blocked":
		"Hay ajustes, pero Aplicar ajustes al instalar está desactivado y falta el complemento",
	"preview.afterInstall": "Se aplicarían los ajustes tras la instalación",
	"preview.afterRepin": "Se aplicarían los ajustes tras el cambio de versión",
	"preview.viaApply":
		"Se aplicaría con Aplicar ajustes o Sincronizar ajustes en cada inicio",
	"preview.changes": {
		one: " ({count} cambio)",
		many: " ({count} cambios)",
		other: " ({count} cambios)",
	},
	"preview.matches": " (ya coincide)",
	"preview.showChanges": {
		one: "Mostrar {count} cambio de ajustes",
		many: "Mostrar {count} cambios de ajustes",
		other: "Mostrar {count} cambios de ajustes",
	},
	"preview.fileNotFound": "No se encontró {file}.",
	"preview.empty": "No hay complementos en la lista.",
	"preview.vaultSetupInvalid": "{file} no es válido",
	"preview.vaultSetupInvalidJson": "{file} no es un JSON válido",
	"preview.badgeInstall": "Instalar",
	"preview.badgeRepin": "Cambiar versión",
	"preview.badgeOkPinned": "Fijado, al día",
	"preview.badgeOtherDevice": "Otro dispositivo",
	"preview.badgeSkip": "Omitir",
	"preview.badgeSettings": "Ajustes",
	"preview.badgeNoSettings": "Sin ajustes",
	"preview.badgeBlocked": "Ajustes bloqueados",
	"preview.badgeNoFile": "Sin archivo de ajustes",
	"preview.badgeNotHere": "Aquí no",
	"preview.statOtherDevices": "Otros dispositivos",

	// Settings tab
	"settings.warningName": "Advertencia de seguridad",
	"settings.warningPrefix": "Advertencia de seguridad: ",
	"settings.warningDesc":
		"Esto puede descargar e instalar complementos de la comunidad. Úsalo solo con bóvedas de confianza y revisa tu lista de complementos antes de activar la instalación automática.",
	"settings.previewName": "Previsualizar importación",
	"settings.previewDesc":
		"Mira qué complementos se instalarían, omitirían o actualizarían y qué ajustes cambiarían, sin modificar tu bóveda.",
	"settings.previewButton": "Previsualizar",
	"settings.exportName": "Exportar configuración de complementos",
	"settings.exportDesc":
		"Guarda tus complementos de la comunidad instalados y sus ajustes en los archivos JSON de {dir}.",
	"settings.exportButton": "Exportar",
	"settings.importName": "Importar configuración de complementos",
	"settings.importDesc":
		"Instala los complementos del archivo de lista. La activación y la aplicación de ajustes siguen las opciones de abajo.",
	"settings.importButton": "Importar",
	"settings.shareName": "Compartir tu configuración",
	"settings.shareDesc":
		"Elige plugins instalados y guárdalos como setup-pack.json en tu bóveda, sin los secretos, para compartirlos con otros.",
	"settings.shareButton": "Exportar paquete",
	"settings.importPackName": "Importar un paquete de configuración",
	"settings.importPackDesc":
		"Añade a tu configuración el paquete de otra persona desde un enlace. Verás lo que contiene antes de que se instale nada.",
	"settings.importPackButton": "Importar desde enlace",
	"settings.updatesName": "Buscar actualizaciones",
	"settings.updatesDesc":
		"Mira qué complementos de la comunidad instalados tienen versiones más recientes y actualízalos. Las versiones fijadas en tu lista de complementos se actualizan con ellos.",
	"settings.updatesButton": "Buscar",
	"settings.undoName": "Deshacer el último cambio",
	"settings.undoDesc":
		"Restaura los ajustes y los archivos de configuración tal como estaban antes de la última importación, actualización de ajustes o exportación. Los complementos instalados siguen instalados.",
	"settings.undoButton": "Deshacer",
	"settings.applyName": "Aplicar ajustes",
	"settings.applyDesc":
		"Actualiza los complementos instalados desde el archivo de ajustes sin reinstalarlos.",
	"settings.applyButton": "Aplicar",
	"settings.autoInstallName": "Instalar complementos automáticamente al iniciar",
	"settings.autoInstallDesc":
		"Al iniciar Obsidian, instala los complementos de tu lista que aún no estén instalados.",
	"settings.autoEnableName":
		"Activar complementos automáticamente tras instalarlos",
	"settings.autoEnableDesc": "Activa los complementos después de instalarlos.",
	"settings.applyOnInstallName": "Aplicar ajustes al instalar",
	"settings.applyOnInstallDesc":
		"Tras instalar un complemento, aplica sus ajustes desde tu archivo de ajustes.",
	"settings.mergeName": "Combinar ajustes en lugar de reemplazarlos",
	"settings.mergeDesc":
		"Actualiza los ajustes que coinciden y conserva el resto. Si está desactivado, los ajustes guardados del complemento se reemplazan por completo.",
	"settings.syncOnStartupName": "Sincronizar ajustes en cada inicio",
	"settings.syncOnStartupDesc":
		"Cada vez que se inicia Obsidian, aplica tu archivo de ajustes a los complementos instalados.",
	"settings.mobileName": "Ejecutar acciones automáticas en móviles",
	"settings.mobileDesc":
		"Permite que la instalación automática y la sincronización de ajustes al iniciar se ejecuten en teléfonos y tabletas. Desactivado de forma predeterminada, para que una configuración de escritorio sincronizada no inicie descargas con datos móviles.",
	"settings.redactName": "Omitir secretos al exportar",
	"settings.redactDesc":
		"Sustituye tokens, contraseñas y claves de API por un marcador en el archivo de ajustes exportado. La importación nunca escribe el marcador sobre un valor real.",
	"settings.extraSecretsName": "Nombres adicionales de ajustes secretos",
	"settings.extraSecretsDesc":
		"Nombres de ajustes separados por comas que también se omitirán, por ejemplo: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName":
		"Sincronizar ajustes de Obsidian, tema, fragmentos, atajos de teclado y complementos principales",
	"settings.syncVaultSetupDesc":
		"Al exportar se guardan en vault-setup.json tus ajustes de Obsidian, tu tema de la comunidad, tus fragmentos CSS, tus atajos de teclado personalizados, los complementos principales con sus ajustes y tus marcadores. Al importar se aplican en el otro dispositivo.",
	"settings.logLevelName": "Nivel de registro",
	"settings.logLevelDesc":
		"Cuánto detalle mostrar en la consola si algo falla. Déjalo en Error salvo que estés solucionando un problema.",
	"settings.logDebug": "Depuración (máximo detalle)",
	"settings.logInfo": "Información",
	"settings.logWarn": "Advertencia",
	"settings.logError": "Error (recomendado)",
	"settings.logNone": "Ninguno",
};
