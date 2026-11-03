import type { LocaleMessages } from "../index";

export const tr: LocaleMessages = {
	// Commands
	"cmd.export": "Eklenti kurulumunu JSON olarak dışa aktar",
	"cmd.preview": "Eklenti kurulumu içe aktarımını önizle",
	"cmd.import": "Eklenti kurulumunu JSON dosyasından içe aktar",
	"cmd.apply": "Ayarları JSON dosyasından uygula",
	"cmd.exportPack": "Paylaşılabilir kurulum paketini dışa aktar",
	"cmd.importPack": "Bağlantıdan kurulum paketi içe aktar",
	"cmd.checkUpdates": "Eklenti güncellemelerini denetle",
	"cmd.undo": "Son içe aktarma, dışa aktarma veya ayar değişikliğini geri al",

	// Shared
	"common.unknownError": "Bilinmeyen hata",
	"common.close": "Kapat",
	"common.cancel": "İptal",
	"common.busy":
		"Başka bir içe aktarma, dışa aktarma veya ayar güncellemesi zaten çalışıyor.",
	"common.startupFailed":
		"Başlangıçta kurulum başarısız oldu. Ayrıntılar için konsola bakın.",
	"common.and": " ve ",
	"device.desktop": "masaüstü",
	"device.mobile": "mobil",
	"progress.step": "{current} / {total} · {detail}",
	"net.rateLimit":
		"GitHub istek sınırına ulaşıldı veya erişim reddedildi. Birkaç dakika bekleyip tekrar deneyin.",

	// Import
	"import.title": "Eklenti kurulumu içe aktarılıyor",
	"import.finished": "İçe aktarma tamamlandı",
	"import.finishedProblems": "İçe aktarma sorunlarla tamamlandı",
	"import.failed": "İçe aktarma başarısız oldu",
	"import.createdEmpty":
		"Boş bir {file} dosyası oluşturuldu. İçine eklenti kimliklerini ekleyip tekrar içe aktarın.",
	"import.cannotCreate":
		"{file} dosyası oluşturulamıyor. Dosya izinlerini kontrol edin.",
	"import.empty":
		"{file} dosyası boş. İçine eklenti kimliklerini ekleyip tekrar içe aktarın.",
	"import.invalidJson": "{file} dosyasında geçersiz JSON: {error}.",
	"import.noPlugins": "Kurulacak eklenti yok.",
	"import.notForMobile":
		"Listedeki eklentilerin hiçbiri bu mobil cihaz için değil.",
	"import.notForDesktop":
		"Listedeki eklentilerin hiçbiri bu masaüstü cihaz için değil.",
	"import.installing": "Kuruluyor: {label}",
	"import.turningOn": "Etkinleştiriliyor: {id}",
	"import.couldNotEnable": "Etkinleştirilemeyenler: {ids}.",
	"import.autoEnableOff":
		"Otomatik etkinleştirme kapalı, bu yüzden yeni eklentiler devre dışı kalır.",
	"import.skippedDesktopOnly": {
		one: "Bu cihazda yalnızca masaüstüne özel {count} eklenti atlandı.",
		other: "Bu cihazda yalnızca masaüstüne özel {count} eklenti atlandı.",
	},
	"import.otherDevices": {
		one: "{count} eklenti yalnızca diğer cihazlar için listelenmiş.",
		other: "{count} eklenti yalnızca diğer cihazlar için listelenmiş.",
	},
	"import.keptOff": "Listede belirtildiği gibi devre dışı bırakılan: {count}.",
	"import.changed": {
		one: "{count} eklenti kuruldu veya güncellendi",
		other: "{count} eklenti kuruldu veya güncellendi",
	},
	"import.upToDate": "Her şey zaten güncel",
	"import.summary": "{summary} ({ok} / {total} başarılı).",
	"import.error": "{error}. Ayrıntılar için konsola bakın.",

	// Vault setup (theme, snippets, hotkeys, core plugins)
	"vaultSetup.invalid": "{file} geçerli değil, bu yüzden atlandı.",
	"vaultSetup.applying":
		"Tema, CSS parçacıkları, kısayol tuşları ve çekirdek eklentiler uygulanıyor",
	"vaultSetup.snippetsWritten": {
		one: "{count} CSS parçacığı eklendi veya güncellendi.",
		other: "{count} CSS parçacığı eklendi veya güncellendi.",
	},
	"vaultSetup.hotkeysSet": {
		one: "{count} komut için kısayol tuşları ayarlandı.",
		other: "{count} komut için kısayol tuşları ayarlandı.",
	},
	"vaultSetup.corePlugins":
		"Çekirdek eklentiler: {on} etkinleştirildi, {off} devre dışı bırakıldı.",
	"vaultSetup.themeDefault": "Varsayılan temaya geçildi",
	"vaultSetup.themeInstalled": "Tema kuruldu: {name} {version}",
	"vaultSetup.themeSwitched": "Geçilen tema: {name}",
	"vaultSetup.noHotkeyManager": "Obsidian kısayol tuşu yöneticisi kullanılamıyor.",
	"vaultSetup.noCoreManager":
		"Obsidian çekirdek eklenti yöneticisi kullanılamıyor.",
	"vaultSetup.noThemeManager": "Obsidian tema yöneticisi kullanılamıyor.",
	"vaultSetup.snippetFailed": 'CSS parçacığı yazılamadı: "{name}".',
	"vaultSetup.themeFailed": 'Tema kurulamadı: "{name}".',
	"vaultSetup.defaultThemeLabel": "varsayılan tema",
	"vaultSetup.describeThemeSame": "Tema: {label} zaten kullanılıyor",
	"vaultSetup.describeThemeSwitch": "Tema: {label} olarak değiştirilecek",
	"vaultSetup.describeSnippets":
		"CSS parçacıkları: {total} ({added} yeni, {changed} değişmiş, {unchanged} aynı)",
	"vaultSetup.describeHotkeys":
		"Kısayol tuşları: {total} komut ({changed} tanesi değişecek)",
	"vaultSetup.describeCore":
		"Çekirdek eklentiler: {on} etkinleştirilecek, {off} devre dışı bırakılacak",
	"vaultSetup.describeCoreSame": "Çekirdek eklentiler: zaten listedeki gibi",

	// Export
	"export.finished": "Dışa aktarma tamamlandı",
	"export.failed": "Dışa aktarma başarısız oldu",
	"export.saved": {
		one: "{count} eklenti ({pinned} sabitlenmiş, {withSettings} ayarlı) kaydedildi: {listFile} ve {settingsFile}.",
		other: "{count} eklenti ({pinned} sabitlenmiş, {withSettings} ayarlı) kaydedildi: {listFile} ve {settingsFile}.",
	},
	"export.kept": {
		one: " Bu cihazda kurulu olmayan eklentiler için {count} kayıt korundu.",
		other: " Bu cihazda kurulu olmayan eklentiler için {count} kayıt korundu.",
	},
	"export.redacted": {
		one: " {count} gizli değer (token, parola) dışarıda bırakıldı.",
		other: " {count} gizli değer (token, parola) dışarıda bırakıldı.",
	},
	"export.snippets": {
		one: "{count} CSS parçacığı",
		other: "{count} CSS parçacığı",
	},
	"export.hotkeys": {
		one: "{count} özel kısayol tuşu",
		other: "{count} özel kısayol tuşu",
	},
	"export.vaultSetup":
		" Ayrıca {theme}, {snippets}, {hotkeys} ve çekirdek eklentileriniz de kaydedildi: {file}.",
	"export.writeFailed": "kurulum JSON dosyaları yazılamadı",

	// Setup packs
	"pack.name": "{vault} kurulumu",
	"pack.savedTitle": "Kurulum paketi kaydedildi",
	"pack.savedSecrets": {
		one: " {count} gizli değer dışarıda bırakıldı.",
		other: " {count} gizli değer dışarıda bırakıldı.",
	},
	"pack.savedBody": {
		one: "Kasanızdaki {file} dosyasında {count} eklenti var.{secrets} Bu dosyayı paylaşın (örneğin bir GitHub gist olarak), başkaları da Bağlantıdan kurulum paketi içe aktar komutunu kullanabilsin.",
		other: "Kasanızdaki {file} dosyasında {count} eklenti var.{secrets} Bu dosyayı paylaşın (örneğin bir GitHub gist olarak), başkaları da Bağlantıdan kurulum paketi içe aktar komutunu kullanabilsin.",
	},
	"pack.notSavedTitle": "Kurulum paketi kaydedilmedi",
	"pack.writeFailed": "{file} dosyası yazılamadı",
	"pack.loadFailedTitle": "Kurulum paketi yüklenemedi",
	"pack.httpsOnly": "yalnızca https bağlantıları yüklenebilir",
	"pack.notFound": "{path} bu kasada bulunamadı",
	"pack.notPackTitle": "Kurulum paketi değil",
	"pack.notPackBody":
		"Dosya, Paylaşılabilir kurulum paketini dışa aktar komutuyla oluşturulmuş bir kurulum paketi değil.",
	"pack.notAddedTitle": "Kurulum paketi eklenmedi",
	"pack.linkTitle": "Kurulum paketi içe aktar",
	"pack.linkDesc":
		"Bir kurulum paketinin web bağlantısını (GitHub gist veya GitHub üzerindeki bir dosya da olur) ya da bu kasadaki bir paket dosyasının yolunu yapıştırın. Sonraki ekranda onaylayana kadar hiçbir şey kurulmaz.",
	"pack.linkName": "Bağlantı veya yol",
	"pack.linkPlaceholder": "Bağlantı veya kasa yolu",
	"pack.load": "Yükle",
	"pack.defaultName": "Kurulum paketi",
	"pack.from": "Kaynak: {source}",
	"pack.warning":
		"Topluluk eklentileri notlarınızı okuyup değiştirebilir. Yalnızca bu paketi hazırlayan kişiye güveniyorsanız devam edin.",
	"pack.pluginCount": {
		one: "{count} eklenti ({withSettings} ayarlı)",
		other: "{count} eklenti ({withSettings} ayarlı)",
	},
	"pack.devicesOnly": " (yalnızca {devices})",
	"pack.staysOff": " (devre dışı kalır)",
	"pack.hasSettings": " · ayarlar",
	"pack.explain":
		"Paket, kendi eklenti listenize ve ayar dosyalarınıza eklenir (ikisinde de bir değer varsa paketteki geçerli olur), ardından içe aktarma çalışır. Son değişikliği geri al ile dosyalar eski hâline döner.",
	"pack.confirm": "Kurulumuma ekle ve içe aktar",

	// Updates
	"updates.checking": "Eklenti güncellemeleri denetleniyor",
	"updates.checkFinished": "Güncelleme denetimi tamamlandı",
	"updates.found": {
		one: "{count} eklenti için güncelleme var.",
		other: "{count} eklenti için güncelleme var.",
	},
	"updates.none": "Tüm topluluk eklentileri güncel.",
	"updates.checkFailed": "Güncelleme denetimi başarısız oldu",
	"updates.updating": "Eklentiler güncelleniyor",
	"updates.step": "Güncelleniyor: {id} → {version}",
	"updates.updated": {
		one: "Güncellenen eklenti: {done} / {count}.",
		other: "Güncellenen eklenti: {done} / {count}.",
	},
	"updates.pinsMoved": {
		one: "{file} dosyasında {count} sabitlenmiş sürüm güncellendi.",
		other: "{file} dosyasında {count} sabitlenmiş sürüm güncellendi.",
	},
	"updates.finished": "Güncelleme tamamlandı",
	"updates.finishedProblems": "Güncelleme sorunlarla tamamlandı",
	"updates.failed": "Güncelleme başarısız oldu",
	"updates.modalTitle": "Eklenti güncellemeleri",
	"updates.update": "Güncelle",
	"updates.updateAll": "Tümünü güncelle ({count})",
	"updates.installed": "Kurulu: {version}",
	"updates.needsApp": "{version} için Obsidian {minApp} gerekli",
	"updates.pinToo":
		"eklenti listenizdeki sabitlenmiş sürüm ({version}) de güncellenecek",

	// Undo
	"undo.nothingTitle": "Geri alınacak bir şey yok",
	"undo.nothingBody":
		"Geri alınacak önceki bir İçe aktar, Ayarları uygula veya Dışa aktar işlemi yok.",
	"undo.incompleteTitle": "Geri alma tamamlanamadı",
	"undo.incompleteBody":
		"Geri yüklenen dosya: {restored} / {total}. Yedek saklanıyor; ayrıntılar için konsola bakın.",
	"undo.doneTitle": "Geri alındı: {reason}",
	"undo.doneBody": {
		one: "Yedek tarihi: {date}. {count} dosya geri yüklendi.{reload}",
		other: "Yedek tarihi: {date}. {count} dosya geri yüklendi.{reload}",
	},
	"undo.reload":
		" Ayarlar penceresini kapattığınızda eklentiler yeniden yüklenecek.",
	"undo.failed": "Geri alma başarısız oldu",
	"reason.import": "içe aktarma",
	"reason.export": "dışa aktarma",
	"reason.apply": "ayarları uygulama",
	"reason.update": "eklentileri güncelleme",
	"reason.pack": "kurulum paketi içe aktarma",
	"reason.settings": "ayar değişikliği",

	// Apply settings
	"apply.title": "Eklenti ayarları uygulanıyor",
	"apply.none": "Hiçbir ayar yazılmadı.",
	"apply.done": "Ayarlar uygulandı",
	"apply.plugins": { one: "{count} eklenti", other: "{count} eklenti" },
	"apply.deferred": {
		one: "Güncellendi: {plugins}. Çalışan {count} eklenti, Ayarlar penceresini kapattığınızda yeniden yüklenecek.",
		other: "Güncellendi: {plugins}. Çalışan {count} eklenti, Ayarlar penceresini kapattığınızda yeniden yüklenecek.",
	},
	"apply.restarted": "Güncellendi: {plugins} ({restarted} tanesi yeniden yüklendi).",
	"apply.updated": "Güncellendi: {plugins}.",
	"apply.failed": "Ayarlar uygulanamadı",
	"apply.fsError": "Dosya sistemine erişilemiyor: {error}",
	"apply.noSettingsFile": "{file} dosyası bulunamadı, ayarlar uygulanmıyor.",
	"apply.cannotWrite":
		"{id} eklentisinin ayarları yazılamıyor. Dosya izinlerini kontrol edin.",
	"apply.writeFailed": "{id} eklentisi için data.json yazılamadı: {error}",

	// Installing a plugin (shown in the import summary)
	"install.invalidId": "Geçersiz eklenti kimliği.",
	"install.invalidIdNamed": 'Geçersiz eklenti kimliği: "{id}".',
	"install.noApi":
		"Obsidian installPlugin API kullanılamıyor. Obsidian uygulamasını güncelleyip tekrar deneyin.",
	"install.notInRegistry":
		'Obsidian topluluk eklentileri kaydında eklenti bulunamadı: "{id}".',
	"install.badRepoInfo":
		'Kayıttaki depo bilgileri geçersiz: "{id}".',
	"install.badRepoFormat": 'Depo biçimi geçersiz ("{id}"): {repo}',
	"install.noPinnedManifest":
		'Manifest alınamadı: "{id}" {version}. GitHub istekleri sınırlıyor olabilir.',
	"install.noRelease": 'Uygun bir sürüm bulunamadı: "{id}".',
	"install.badManifest": 'Geçersiz manifest.json: "{id}".',
	"install.failed": 'Eklenti kurulamadı ("{id}"): {error}',
	"enable.noApi":
		"Eklenti API erişimi yok. Eklentilerin elle etkinleştirilmesi gerekecek.",

	// Files and the plugin list
	"file.readFailed": "Dosya okunamadı: {error}",
	"file.writeFailed": "Dosya yazılamadı: {error}",
	"file.empty":
		"{file} dosyası boş. İçerik ekleyin, aksi hâlde dosya yeniden oluşturulacak.",
	"file.invalidJson":
		"{file} dosyasında geçersiz JSON: {error}. Dosya biçimini kontrol edin.",
	"list.notArray":
		"{file} dosyası, eklenti kimliklerinden veya { id, version } nesnelerinden oluşan bir dizi içermelidir.",
	"list.skipped": {
		one: "{file} dosyasındaki {count} geçersiz kayıt atlandı. Konsola bakın.",
		other: "{file} dosyasındaki {count} geçersiz kayıt atlandı. Konsola bakın.",
	},

	// Import preview
	"preview.title": "İçe aktarma önizlemesi",
	"preview.failed": "Önizleme başarısız oldu: {error}",
	"preview.listNotFound": "Önizleme: {file} bulunamadı.",
	"preview.listInvalidJson": "Önizleme: {file} dosyasında geçersiz JSON.",
	"preview.otherDevice":
		"Yalnızca şu cihazlar için listelenmiş: {devices}; bu cihazda atlanır",
	"preview.notOnDevice": "Bu cihazda uygulanmaz",
	"preview.installPinned": "Kurulacak: @{version}",
	"preview.installLatest": "Kurulacak (en son kararlı sürüm)",
	"preview.leftOff": ", devre dışı bırakılacak",
	"preview.alreadyPinned": "Zaten sabitlenmiş sürümde: {version}",
	"preview.wouldChange": "Değişecek: {from} → {to}",
	"preview.unknownVersion": "bilinmiyor",
	"preview.installedSkip": "Zaten kurulu: @{version} (sabitlenmemiş, atlanır)",
	"preview.installedSkipNoVersion": "Zaten kurulu (sabitlenmemiş, atlanır)",
	"preview.settingsMissing": "{file} eksik",
	"preview.noEntry": "Ayar kaydı yok",
	"preview.blocked":
		"Ayarlar var, ancak Kurulumda ayarları uygula kapalı ve eklenti kurulu değil",
	"preview.afterInstall": "Ayarlar kurulumdan sonra uygulanacak",
	"preview.afterRepin": "Ayarlar sürüm değişikliğinden sonra uygulanacak",
	"preview.viaApply":
		"Ayarları uygula veya Her başlangıçta ayarları eşitle ile uygulanacak",
	"preview.changes": {
		one: " ({count} değişiklik)",
		other: " ({count} değişiklik)",
	},
	"preview.matches": " (zaten aynı)",
	"preview.showChanges": {
		one: "{count} ayar değişikliğini göster",
		other: "{count} ayar değişikliğini göster",
	},
	"preview.fileNotFound": "{file} bulunamadı.",
	"preview.empty": "Listede eklenti yok.",
	"preview.vaultSetupInvalid": "{file} geçerli değil",
	"preview.vaultSetupInvalidJson": "{file} geçerli bir JSON değil",
	"preview.badgeInstall": "Kur",
	"preview.badgeRepin": "Sürüm değişecek",
	"preview.badgeOkPinned": "Sabit, güncel",
	"preview.badgeOtherDevice": "Diğer cihaz",
	"preview.badgeSkip": "Atla",
	"preview.badgeSettings": "Ayarlar",
	"preview.badgeNoSettings": "Ayar yok",
	"preview.badgeBlocked": "Ayarlar engelli",
	"preview.badgeNoFile": "Ayar dosyası yok",
	"preview.badgeNotHere": "Burada değil",
	"preview.statOtherDevices": "Diğer cihazlar",

	// Settings tab
	"settings.warningName": "Güvenlik uyarısı",
	"settings.warningPrefix": "Güvenlik uyarısı: ",
	"settings.warningDesc":
		"Bu eklenti topluluk eklentilerini indirip kurabilir. Yalnızca güvendiğiniz kasalarda kullanın ve otomatik kurulumu etkinleştirmeden önce eklenti listenizi gözden geçirin.",
	"settings.actionsName": "Dışa aktar / İçe aktar",
	"settings.actionsDesc":
		"Eklenti listesini ve ayar dosyalarını yönetin. Konum: {dir}",
	"settings.previewName": "İçe aktarmayı önizle",
	"settings.previewDesc":
		"Kasanızı değiştirmeden hangi eklentilerin kurulacağını, atlanacağını veya güncelleneceğini ve hangi ayarların değişeceğini görün.",
	"settings.previewButton": "Önizle",
	"settings.exportName": "Eklenti kurulumunu dışa aktar",
	"settings.exportDesc":
		"Kurulu topluluk eklentilerinizi ve ayarlarını JSON dosyalarına kaydedin. Konum: {dir}",
	"settings.exportButton": "Dışa aktar",
	"settings.importName": "Eklenti kurulumunu içe aktar",
	"settings.importDesc":
		"Liste dosyasındaki eklentileri kurun. Etkinleştirme ve ayarların uygulanması aşağıdaki seçeneklere göre yapılır.",
	"settings.importButton": "İçe aktar",
	"settings.shareName": "Kurulumunuzu paylaşın",
	"settings.shareDesc":
		"Kurulu olan her şeyi, gizli değerler hariç, başkalarıyla paylaşmak için kasanıza setup-pack.json olarak kaydedin.",
	"settings.shareButton": "Paketi dışa aktar",
	"settings.importPackName": "Kurulum paketi içe aktar",
	"settings.importPackDesc":
		"Başka birinin kurulum paketini bir bağlantıdan kendi kurulumunuza ekleyin. Herhangi bir şey kurulmadan önce paketin içeriğini görürsünüz.",
	"settings.importPackButton": "Bağlantıdan içe aktar",
	"settings.importPackShortButton": "Paketi içe aktar",
	"settings.updatesName": "Güncellemeleri denetle",
	"settings.updatesDesc":
		"Kurulu topluluk eklentilerinden hangilerinin daha yeni sürümü olduğunu görün ve onları güncelleyin. Eklenti listenizdeki sabitlenmiş sürümler de buna göre güncellenir.",
	"settings.updatesButton": "Denetle",
	"settings.updatesLongButton": "Güncellemeleri denetle",
	"settings.undoName": "Son değişikliği geri al",
	"settings.undoDesc":
		"Ayarları ve kurulum dosyalarını son içe aktarma, ayar güncellemesi veya dışa aktarmadan önceki hâline getirin. Kurulu eklentiler kurulu kalır.",
	"settings.undoButton": "Geri al",
	"settings.applyName": "Ayarları uygula",
	"settings.applyDesc":
		"Kurulu eklentileri yeniden kurmadan ayar dosyasından güncelleyin.",
	"settings.applyButton": "Uygula",
	"settings.autoInstallName": "Başlangıçta eklentileri otomatik kur",
	"settings.autoInstallDesc":
		"Obsidian başladığında, listenizde olup henüz kurulmamış eklentileri kurar.",
	"settings.autoEnableName": "Kurulumdan sonra eklentileri otomatik etkinleştir",
	"settings.autoEnableDesc": "Eklentileri kurulduktan sonra etkinleştirir.",
	"settings.applyOnInstallName": "Kurulumda ayarları uygula",
	"settings.applyOnInstallDesc":
		"Bir eklenti kurulduktan sonra ayarlarını ayar dosyanızdan uygular.",
	"settings.mergeName": "Ayarları değiştirmek yerine birleştir",
	"settings.mergeDesc":
		"Eşleşen ayarları günceller, geri kalanını korur. Kapalıyken eklentinin kayıtlı ayarlarının tamamı değiştirilir.",
	"settings.syncOnStartupName": "Her başlangıçta ayarları eşitle",
	"settings.syncOnStartupDesc":
		"Obsidian her başladığında ayar dosyanızı kurulu eklentilere uygular.",
	"settings.mobileName": "Otomatik işlemleri mobilde çalıştır",
	"settings.mobileDesc":
		"Başlangıçtaki otomatik kurulumun ve ayar eşitlemenin telefon ve tabletlerde çalışmasına izin verir. Eşitlenen bir masaüstü kurulumu mobil veriyle indirme başlatmasın diye varsayılan olarak kapalıdır.",
	"settings.redactName": "Dışa aktarırken gizli değerleri dışarıda bırak",
	"settings.redactDesc":
		"Dışa aktarılan ayar dosyasında token, parola ve API anahtarlarını bir yer tutucuyla değiştirir. İçe aktarma, yer tutucuyu hiçbir zaman gerçek bir değerin üzerine yazmaz.",
	"settings.extraSecretsName": "Ek gizli ayar adları",
	"settings.extraSecretsDesc":
		"Ayrıca dışarıda bırakılacak, virgülle ayrılmış ayar adları; örneğin: licenseCode, endpoint",
	"settings.extraSecretsPlaceholder": "Lisans kodu, endpoint",
	"settings.syncVaultSetupName":
		"Temayı, CSS parçacıklarını, kısayol tuşlarını ve çekirdek eklentileri eşitle",
	"settings.syncVaultSetupDesc":
		"Dışa aktarma; topluluk temanızı, CSS parçacıklarınızı, özel kısayol tuşlarınızı ve hangi çekirdek eklentilerin açık olduğunu vault-setup.json dosyasına kaydeder. İçe aktarma bunları diğer cihazda uygular.",
	"settings.logLevelName": "Günlük düzeyi",
	"settings.logLevelDesc":
		"Bir sorun çıkarsa konsolda ne kadar ayrıntı gösterileceği. Sorun gidermiyorsanız Hata seçeneğinde bırakın.",
	"settings.logDebug": "Hata ayıklama (en ayrıntılı)",
	"settings.logInfo": "Bilgi",
	"settings.logWarn": "Uyarı",
	"settings.logError": "Hata (önerilen)",
	"settings.logNone": "Hiçbiri",
};
