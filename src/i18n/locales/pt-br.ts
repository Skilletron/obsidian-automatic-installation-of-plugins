import type { LocaleMessages } from "../index";

export const ptBR: LocaleMessages = {
	// Commands
	"cmd.export": "Exportar configuração de plugins para JSON",
	"cmd.preview": "Pré-visualizar importação da configuração de plugins",
	"cmd.import": "Importar configuração de plugins do JSON",
	"cmd.apply": "Aplicar configurações do JSON",
	"cmd.exportPack": "Exportar pacote de configuração compartilhável",
	"cmd.importPack": "Importar pacote de configuração de um link",
	"cmd.checkUpdates": "Verificar atualizações de plugins",
	"cmd.undo":
		"Desfazer a última importação, exportação ou alteração de configurações",

	// Shared
	"common.unknownError": "Erro desconhecido",
	"common.close": "Fechar",
	"common.cancel": "Cancelar",
	"common.busy":
		"Outra importação, exportação ou atualização de configurações já está em andamento.",
	"common.startupFailed":
		"A instalação na inicialização falhou. Veja o console para mais detalhes.",
	"common.and": " e ",
	"device.desktop": "desktop",
	"device.mobile": "dispositivo móvel",
	"progress.step": "{current} de {total} · {detail}",
	"net.rateLimit":
		"Limite de requisições do GitHub atingido ou acesso negado. Aguarde alguns minutos e tente novamente.",

	// Import
	"import.title": "Importando configuração de plugins",
	"import.finished": "Importação concluída",
	"import.finishedProblems": "Importação concluída com problemas",
	"import.failed": "A importação falhou",
	"import.createdEmpty":
		"Um {file} vazio foi criado. Adicione IDs de plugins a ele e importe novamente.",
	"import.cannotCreate":
		"Não foi possível criar {file}. Verifique as permissões do arquivo.",
	"import.empty":
		"{file} está vazio. Adicione IDs de plugins a ele e importe novamente.",
	"import.invalidJson": "JSON inválido em {file}: {error}.",
	"import.noPlugins": "Nenhum plugin para instalar.",
	"import.notForMobile":
		"Nenhum plugin da lista é destinado a este dispositivo móvel.",
	"import.notForDesktop": "Nenhum plugin da lista é destinado a este computador.",
	"import.installing": "Instalando {label}",
	"import.turningOn": "Ativando {id}",
	"import.couldNotEnable": "Não foi possível ativar: {ids}.",
	"import.autoEnableOff":
		"A ativação automática está desligada, então os novos plugins ficam desativados.",
	"import.skippedDesktopOnly": {
		one: "{count} plugin exclusivo para desktop foi ignorado neste dispositivo.",
		many: "{count} plugins exclusivos para desktop foram ignorados neste dispositivo.",
		other: "{count} plugins exclusivos para desktop foram ignorados neste dispositivo.",
	},
	"import.otherDevices": {
		one: "{count} plugin está listado apenas para outros dispositivos.",
		many: "{count} plugins estão listados apenas para outros dispositivos.",
		other: "{count} plugins estão listados apenas para outros dispositivos.",
	},
	"import.keptOff": "Plugins mantidos desativados conforme a lista: {count}.",
	"import.changed": {
		one: "{count} plugin instalado ou atualizado",
		many: "{count} plugins instalados ou atualizados",
		other: "{count} plugins instalados ou atualizados",
	},
	"import.upToDate": "Tudo já estava atualizado",
	"import.summary": "{summary} ({ok} de {total} OK).",
	"import.error": "{error}. Veja o console para mais detalhes.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} não é válido, então foi ignorado.",
	"vaultSetup.applying": "Aplicando tema, trechos CSS, atalhos e plugins principais",
	"vaultSetup.snippetsWritten": {
		one: "{count} trecho CSS adicionado ou atualizado.",
		many: "{count} trechos CSS adicionados ou atualizados.",
		other: "{count} trechos CSS adicionados ou atualizados.",
	},
	"vaultSetup.hotkeysSet": {
		one: "Atalhos definidos para {count} comando.",
		many: "Atalhos definidos para {count} comandos.",
		other: "Atalhos definidos para {count} comandos.",
	},
	"vaultSetup.corePlugins":
		"Plugins principais: {on} ativados, {off} desativados.",
	"vaultSetup.themeDefault": "Tema padrão aplicado",
	"vaultSetup.themeInstalled": "Tema {name} {version} instalado",
	"vaultSetup.themeSwitched": "Tema alterado para {name}",
	"vaultSetup.noHotkeyManager":
		"O gerenciador de atalhos do Obsidian não está disponível.",
	"vaultSetup.noCoreManager":
		"O gerenciador de plugins principais do Obsidian não está disponível.",
	"vaultSetup.noThemeManager":
		"O gerenciador de temas do Obsidian não está disponível.",
	"vaultSetup.snippetFailed": 'Não foi possível gravar o trecho CSS "{name}".',
	"vaultSetup.themeFailed": 'Não foi possível instalar o tema "{name}".',
	"vaultSetup.defaultThemeLabel": "o tema padrão",
	"vaultSetup.describeThemeSame": "Tema: já usando {label}",
	"vaultSetup.describeThemeSwitch": "Tema: mudaria para {label}",
	"vaultSetup.describeSnippets":
		"Trechos CSS: {total} ({added} novos, {changed} alterados, {unchanged} sem alteração)",
	"vaultSetup.describeHotkeys": "Atalhos: {total} comandos ({changed} mudariam)",
	"vaultSetup.describeCore":
		"Plugins principais: ativaria {on}, desativaria {off}",
	"vaultSetup.describeCoreSame": "Plugins principais: já estão conforme a lista",

	// Export
	"export.finished": "Exportação concluída",
	"export.failed": "A exportação falhou",
	"export.saved": {
		one: "{count} plugin ({pinned} com versão fixada, {withSettings} com configurações) salvo em {listFile} e {settingsFile}.",
		many: "{count} plugins ({pinned} com versão fixada, {withSettings} com configurações) salvos em {listFile} e {settingsFile}.",
		other: "{count} plugins ({pinned} com versão fixada, {withSettings} com configurações) salvos em {listFile} e {settingsFile}.",
	},
	"export.kept": {
		one: " {count} entrada de plugins não instalados neste dispositivo foi mantida.",
		many: " {count} entradas de plugins não instalados neste dispositivo foram mantidas.",
		other: " {count} entradas de plugins não instalados neste dispositivo foram mantidas.",
	},
	"export.redacted": {
		one: " {count} valor secreto (tokens, senhas) foi omitido.",
		many: " {count} valores secretos (tokens, senhas) foram omitidos.",
		other: " {count} valores secretos (tokens, senhas) foram omitidos.",
	},
	"export.snippets": {
		one: "{count} trecho CSS",
		many: "{count} trechos CSS",
		other: "{count} trechos CSS",
	},
	"export.hotkeys": {
		one: "{count} atalho personalizado",
		many: "{count} atalhos personalizados",
		other: "{count} atalhos personalizados",
	},
	"export.vaultSetup":
		" Também foram salvos {theme}, {snippets}, {hotkeys} e seus plugins principais em {file}.",
	"export.writeFailed":
		"não foi possível gravar os arquivos JSON de configuração",

	// Setup packs
	"pack.name": "Configuração de {vault}",
	"pack.savedTitle": "Pacote de configuração salvo",
	"pack.savedSecrets": {
		one: " {count} valor secreto foi omitido.",
		many: " {count} valores secretos foram omitidos.",
		other: " {count} valores secretos foram omitidos.",
	},
	"pack.savedBody": {
		one: "{file} no seu cofre tem {count} plugin.{secrets} Compartilhe-o (por exemplo, como um gist do GitHub) e outras pessoas poderão usar Importar pacote de configuração de um link.",
		many: "{file} no seu cofre tem {count} plugins.{secrets} Compartilhe-o (por exemplo, como um gist do GitHub) e outras pessoas poderão usar Importar pacote de configuração de um link.",
		other: "{file} no seu cofre tem {count} plugins.{secrets} Compartilhe-o (por exemplo, como um gist do GitHub) e outras pessoas poderão usar Importar pacote de configuração de um link.",
	},
	"pack.notSavedTitle": "Pacote de configuração não salvo",
	"pack.writeFailed": "não foi possível gravar {file}",
	"pack.loadFailedTitle": "Não foi possível carregar o pacote de configuração",
	"pack.httpsOnly": "apenas links https podem ser carregados",
	"pack.notFound": "{path} não foi encontrado neste cofre",
	"pack.notPackTitle": "Não é um pacote de configuração",
	"pack.notPackBody":
		"O arquivo não é um pacote de configuração criado com Exportar pacote de configuração compartilhável.",
	"pack.notAddedTitle": "Pacote de configuração não adicionado",
	"pack.linkTitle": "Importar um pacote de configuração",
	"pack.linkDesc":
		"Cole um link para um pacote de configuração (um gist do GitHub ou um arquivo no GitHub também funcionam) ou o caminho de um arquivo de pacote neste cofre. Nada é instalado até você confirmar na próxima tela.",
	"pack.linkName": "Link ou caminho",
	"pack.linkPlaceholder": "Link ou caminho no cofre",
	"pack.load": "Carregar",
	"pack.defaultName": "Pacote de configuração",
	"pack.from": "Origem: {source}",
	"pack.warning":
		"Plugins da comunidade podem ler e alterar suas notas. Só continue se você confia em quem criou este pacote.",
	"pack.pluginCount": {
		one: "{count} plugin ({withSettings} com configurações)",
		many: "{count} plugins ({withSettings} com configurações)",
		other: "{count} plugins ({withSettings} com configurações)",
	},
	"pack.devicesOnly": " (somente {devices})",
	"pack.staysOff": " (fica desativado)",
	"pack.hasSettings": " · configurações",
	"pack.explain":
		"O pacote é adicionado à sua própria lista de plugins e aos seus arquivos de configurações (ele prevalece onde ambos definem algo) e, em seguida, a importação é executada. Desfazer a última alteração restaura os arquivos.",
	"pack.confirm": "Adicionar à minha configuração e importar",

	// Updates
	"updates.checking": "Verificando atualizações de plugins",
	"updates.checkFinished": "Verificação de atualizações concluída",
	"updates.found": {
		one: "{count} plugin tem uma atualização.",
		many: "{count} plugins têm atualizações.",
		other: "{count} plugins têm atualizações.",
	},
	"updates.none": "Todos os plugins da comunidade estão atualizados.",
	"updates.checkFailed": "A verificação de atualizações falhou",
	"updates.updating": "Atualizando plugins",
	"updates.step": "Atualizando {id} para {version}",
	"updates.updated": {
		one: "{done} de {count} plugin atualizado.",
		many: "{done} de {count} plugins atualizados.",
		other: "{done} de {count} plugins atualizados.",
	},
	"updates.pinsMoved": {
		one: "{count} versão fixada atualizada em {file}.",
		many: "{count} versões fixadas atualizadas em {file}.",
		other: "{count} versões fixadas atualizadas em {file}.",
	},
	"updates.finished": "Atualização concluída",
	"updates.finishedProblems": "Atualização concluída com problemas",
	"updates.failed": "A atualização falhou",
	"updates.modalTitle": "Atualizações de plugins",
	"updates.update": "Atualizar",
	"updates.updateAll": "Atualizar todos ({count})",
	"updates.installed": "Instalada: {version}",
	"updates.needsApp": "{version} requer Obsidian {minApp}",
	"updates.pinToo":
		"a versão fixada na sua lista de plugins ({version}) também será atualizada",

	// Undo
	"undo.nothingTitle": "Nada para desfazer",
	"undo.nothingBody":
		"Não há nenhuma ação anterior de Importar, Aplicar configurações ou Exportar para desfazer.",
	"undo.incompleteTitle": "Desfazer incompleto",
	"undo.incompleteBody":
		"{restored} de {total} arquivos restaurados. O backup foi mantido; veja o console para mais detalhes.",
	"undo.doneTitle": "Desfeito: {reason}",
	"undo.doneBody": {
		one: "De {date}: {count} arquivo restaurado.{reload}",
		many: "De {date}: {count} arquivos restaurados.{reload}",
		other: "De {date}: {count} arquivos restaurados.{reload}",
	},
	"undo.reload":
		" Os plugins serão recarregados quando você fechar as Configurações.",
	"undo.failed": "Não foi possível desfazer",
	"reason.import": "importação",
	"reason.export": "exportação",
	"reason.apply": "aplicar configurações",
	"reason.update": "atualizar plugins",
	"reason.pack": "importar pacote de configuração",
	"reason.settings": "alteração de configurações",

	// Apply settings
	"apply.title": "Aplicando configurações de plugins",
	"apply.none": "Nenhuma configuração foi gravada.",
	"apply.done": "Configurações aplicadas",
	"apply.plugins": {
		one: "{count} plugin",
		many: "{count} plugins",
		other: "{count} plugins",
	},
	"apply.deferred": {
		one: "Atualização concluída: {plugins}. {count} plugin em execução será recarregado quando você fechar as Configurações.",
		many: "Atualização concluída: {plugins}. {count} plugins em execução serão recarregados quando você fechar as Configurações.",
		other: "Atualização concluída: {plugins}. {count} plugins em execução serão recarregados quando você fechar as Configurações.",
	},
	"apply.restarted":
		"Atualização concluída: {plugins} ({restarted} recarregados).",
	"apply.updated": "Atualização concluída: {plugins}.",
	"apply.failed": "A aplicação das configurações falhou",
	"apply.fsError": "Não foi possível acessar o sistema de arquivos: {error}",
	"apply.noSettingsFile":
		"Nenhum arquivo {file} encontrado; as configurações não serão aplicadas.",
	"apply.cannotWrite":
		"Não foi possível gravar as configurações do plugin {id}. Verifique as permissões do arquivo.",
	"apply.writeFailed": "Falha ao gravar data.json do plugin {id}: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "ID de plugin inválido.",
	"install.invalidIdNamed": 'ID de plugin inválido: "{id}".',
	"install.noApi":
		"A API installPlugin do Obsidian não está disponível. Atualize o Obsidian e tente novamente.",
	"install.notInRegistry":
		'Plugin "{id}" não encontrado no registro de plugins da comunidade do Obsidian.',
	"install.badRepoInfo":
		'O plugin "{id}" tem informações de repositório inválidas no registro.',
	"install.badRepoFormat":
		'O plugin "{id}" tem um formato de repositório inválido: {repo}',
	"install.noPinnedManifest":
		'Não foi possível obter o manifesto de "{id}" {version}. O GitHub pode estar limitando as requisições.',
	"install.noRelease":
		'Nenhuma versão adequada encontrada para o plugin "{id}".',
	"install.badManifest": 'manifest.json inválido para "{id}".',
	"install.failed": 'Falha ao instalar o plugin "{id}": {error}',
	"enable.noApi":
		"Não foi possível acessar a API de plugins. Os plugins precisarão ser ativados manualmente.",

	// Files and the plugin list
	"file.readFailed": "Falha ao ler o arquivo: {error}",
	"file.writeFailed": "Falha ao gravar o arquivo: {error}",
	"file.empty":
		"{file} está vazio. Adicione conteúdo ou o arquivo será recriado.",
	"file.invalidJson":
		"JSON inválido em {file}: {error}. Verifique o formato do arquivo.",
	"list.notArray":
		"{file} deve conter uma lista de IDs de plugins ou objetos { id, version }.",
	"list.skipped": {
		one: "{count} entrada inválida em {file} foi ignorada. Veja o console.",
		many: "{count} entradas inválidas em {file} foram ignoradas. Veja o console.",
		other: "{count} entradas inválidas em {file} foram ignoradas. Veja o console.",
	},

	// Import preview
	"preview.title": "Pré-visualização da importação",
	"preview.failed": "A pré-visualização falhou: {error}",
	"preview.listNotFound": "Pré-visualização: {file} não encontrado.",
	"preview.listInvalidJson": "Pré-visualização: JSON inválido em {file}.",
	"preview.otherDevice":
		"Listado apenas para {devices}; ignorado neste dispositivo",
	"preview.notOnDevice": "Não aplicado neste dispositivo",
	"preview.installPinned": "Instalaria @{version}",
	"preview.installLatest": "Instalaria (última versão estável)",
	"preview.leftOff": ", deixado desativado",
	"preview.alreadyPinned": "Já está na versão fixada {version}",
	"preview.wouldChange": "Mudaria {from} → {to}",
	"preview.unknownVersion": "desconhecida",
	"preview.installedSkip":
		"Já instalado @{version} (sem versão fixada, ignorado)",
	"preview.installedSkipNoVersion": "Já instalado (sem versão fixada, ignorado)",
	"preview.settingsMissing": "{file} ausente",
	"preview.noEntry": "Sem entrada de configurações",
	"preview.blocked":
		"Há configurações, mas Aplicar configurações na instalação está desligado e o plugin não está instalado",
	"preview.afterInstall": "Aplicaria as configurações após a instalação",
	"preview.afterRepin": "Aplicaria as configurações após a mudança de versão",
	"preview.viaApply":
		"Seria aplicado com Aplicar configurações ou Sincronizar configurações a cada inicialização",
	"preview.changes": {
		one: " ({count} alteração)",
		many: " ({count} alterações)",
		other: " ({count} alterações)",
	},
	"preview.matches": " (já corresponde)",
	"preview.showChanges": {
		one: "Mostrar {count} alteração de configuração",
		many: "Mostrar {count} alterações de configuração",
		other: "Mostrar {count} alterações de configuração",
	},
	"preview.fileNotFound": "{file} não foi encontrado.",
	"preview.empty": "Nenhum plugin na lista.",
	"preview.vaultSetupInvalid": "{file} não é válido",
	"preview.vaultSetupInvalidJson": "{file} não é um JSON válido",
	"preview.badgeInstall": "Instalar",
	"preview.badgeRepin": "Mudar versão",
	"preview.badgeOkPinned": "Fixado, OK",
	"preview.badgeOtherDevice": "Outro dispositivo",
	"preview.badgeSkip": "Ignorar",
	"preview.badgeSettings": "Configurações",
	"preview.badgeNoSettings": "Sem configurações",
	"preview.badgeBlocked": "Configurações bloqueadas",
	"preview.badgeNoFile": "Sem arquivo de configurações",
	"preview.badgeNotHere": "Não aqui",
	"preview.statOtherDevices": "Outros dispositivos",

	// Settings tab
	"settings.warningName": "Aviso de segurança",
	"settings.warningPrefix": "Aviso de segurança: ",
	"settings.warningDesc":
		"Isto pode baixar e instalar plugins da comunidade. Use apenas com cofres confiáveis e revise sua lista de plugins antes de ativar a instalação automática.",
	"settings.previewName": "Pré-visualizar importação",
	"settings.previewDesc":
		"Veja quais plugins seriam instalados, ignorados ou atualizados e quais configurações mudariam — sem alterar seu cofre.",
	"settings.previewButton": "Pré-visualizar",
	"settings.exportName": "Exportar configuração de plugins",
	"settings.exportDesc":
		"Salve seus plugins da comunidade instalados e as configurações deles nos arquivos JSON em {dir}.",
	"settings.exportButton": "Exportar",
	"settings.importName": "Importar configuração de plugins",
	"settings.importDesc":
		"Instale os plugins do arquivo de lista. A ativação e a aplicação das configurações seguem as opções abaixo.",
	"settings.importButton": "Importar",
	"settings.shareName": "Compartilhar sua configuração",
	"settings.shareDesc":
		"Salve tudo o que você tem instalado como setup-pack.json no seu cofre, sem os segredos, para compartilhar com outras pessoas.",
	"settings.shareButton": "Exportar pacote",
	"settings.importPackName": "Importar um pacote de configuração",
	"settings.importPackDesc":
		"Adicione o pacote de configuração de outra pessoa ao seu a partir de um link. Você vê o que ele contém antes de qualquer instalação.",
	"settings.importPackButton": "Importar de um link",
	"settings.updatesName": "Verificar atualizações",
	"settings.updatesDesc":
		"Veja quais plugins da comunidade instalados têm versões mais novas e atualize-os. As versões fixadas na sua lista de plugins são atualizadas junto.",
	"settings.updatesButton": "Verificar",
	"settings.undoName": "Desfazer a última alteração",
	"settings.undoDesc":
		"Restaura as configurações e os arquivos de configuração como estavam antes da última importação, atualização de configurações ou exportação. Os plugins instalados continuam instalados.",
	"settings.undoButton": "Desfazer",
	"settings.applyName": "Aplicar configurações",
	"settings.applyDesc":
		"Atualiza os plugins instalados a partir do arquivo de configurações sem reinstalá-los.",
	"settings.applyButton": "Aplicar",
	"settings.autoInstallName": "Instalar plugins automaticamente na inicialização",
	"settings.autoInstallDesc":
		"Quando o Obsidian iniciar, instala os plugins da sua lista que ainda não estão instalados.",
	"settings.autoEnableName": "Ativar plugins automaticamente após a instalação",
	"settings.autoEnableDesc": "Ativa os plugins depois que eles forem instalados.",
	"settings.applyOnInstallName": "Aplicar configurações na instalação",
	"settings.applyOnInstallDesc":
		"Após instalar um plugin, aplica as configurações dele a partir do seu arquivo de configurações.",
	"settings.mergeName": "Mesclar configurações em vez de substituir",
	"settings.mergeDesc":
		"Atualiza as configurações correspondentes e mantém o resto. Quando desligado, as configurações salvas do plugin são substituídas por completo.",
	"settings.syncOnStartupName": "Sincronizar configurações a cada inicialização",
	"settings.syncOnStartupDesc":
		"Sempre que o Obsidian iniciar, aplica seu arquivo de configurações aos plugins instalados.",
	"settings.mobileName": "Executar ações automáticas em dispositivos móveis",
	"settings.mobileDesc":
		"Permite que a instalação automática e a sincronização de configurações na inicialização rodem em celulares e tablets. Desligado por padrão, para que uma configuração de desktop sincronizada não inicie downloads usando dados móveis.",
	"settings.redactName": "Omitir segredos na exportação",
	"settings.redactDesc":
		"Substitui tokens, senhas e chaves de API por um marcador no arquivo de configurações exportado. A importação nunca grava o marcador por cima de um valor real.",
	"settings.extraSecretsName": "Nomes extras de configurações secretas",
	"settings.extraSecretsDesc":
		"Nomes de configurações separados por vírgula que também devem ser omitidos, por exemplo: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "licenseCode, endpoint",
	"settings.syncVaultSetupName":
		"Sincronizar tema, trechos CSS, atalhos e plugins principais",
	"settings.syncVaultSetupDesc":
		"A exportação salva em vault-setup.json seu tema da comunidade, seus trechos CSS, seus atalhos personalizados e quais plugins principais estão ativados. A importação os aplica no outro dispositivo.",
	"settings.logLevelName": "Nível de log",
	"settings.logLevelDesc":
		"Quanto detalhe mostrar no console se algo der errado. Deixe em Erro, a menos que esteja investigando um problema.",
	"settings.logDebug": "Depuração (mais detalhes)",
	"settings.logInfo": "Informação",
	"settings.logWarn": "Aviso",
	"settings.logError": "Erro (recomendado)",
	"settings.logNone": "Nenhum",
};
