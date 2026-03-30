# turkisheco

`turkisheco` iki ana parçadan oluşur:

- `turkisheco-frontend/`: aktif Angular frontend
- `backend/Turkisheco.Api/`: ASP.NET Core API

## Aktif Frontend Klasörü

Aktif ve deploy edilmesi gereken tek frontend klasörü `turkisheco-frontend/` dizinidir.

Kök dizindeki eski Angular scaffold'u yanlışlıkla build edilmesin diye `archive/legacy-root-angular/` altına taşındı. Build ve deploy pipeline'ları sadece `turkisheco-frontend/` klasörünü hedeflemelidir.

## Repo Yapısı

- `turkisheco-frontend/`: aktif Angular SSR uygulaması
- `backend/Turkisheco.Api/`: PostgreSQL kullanan .NET 8 API
- `archive/legacy-root-angular/`: artık kullanılmayan eski kök Angular projesi
- `docs/writer-auth-plan.md`: writer giriş mimarisi ve rol matrisi
- `docs/editorial-workflow.md`: admin/writer rol yetkileri ve içerik yaşam döngüsü

## Frontend

Geliştirme:

```bash
cd turkisheco-frontend
npm install
npm start
```

Production build:

```bash
cd turkisheco-frontend
npm run build
```

Environment dosyaları:

- `turkisheco-frontend/src/environments/environment.ts`: local development API adresi
- `turkisheco-frontend/src/environments/environment.prod.ts`: production API adresi

Not: `environment.prod.ts` içinde varsayılan production API alanı `https://api.turkisheco.com/api` olarak ayarlandı. Canlı domain farklıysa deploy öncesinde bu dosyayı güncelleyin.

## Writer Giriş Stratejisi

Writer girişi için seçilen URL yapısı `/{username}` değil, `/w/{username}` olarak sabitlendi.

Örnek:

```text
https://turkisheco.com/w/laika
```

Bu karar public route çakışmalarını önlemek için alındı. Ayrıntılı rol ve erişim matrisi için [docs/writer-auth-plan.md](/home/ela/Masaüstü/turkisheco/docs/writer-auth-plan.md) dosyasına bakın.

Admin/writer editorial akışının güncel özeti için [docs/editorial-workflow.md](/home/ela/Masaüstü/turkisheco/docs/editorial-workflow.md) dosyasına bakın.

## Backend

API'yi çalıştırma:

```bash
dotnet run --project backend/Turkisheco.Api
```

Production için gerekli gizli ayarlar repo dışında tutulmalıdır. Uygulama şu değerleri environment variable veya secret store üzerinden bekler:

- `ConnectionStrings__DefaultConnection`
- `Jwt__Key`
- `Jwt__Issuer`
- `Jwt__Audience`
- `WriterAuth__CodePepper`
- `Mail__SmtpHost`
- `Mail__SmtpPort`
- `Mail__EnableSsl`
- `Mail__Username`
- `Mail__Password`
- `Mail__FromEmail`
- `Mail__FromName`
- `Cors__AllowedOrigins__0`
- `Cors__AllowedOrigins__1`

Alternatif olarak `Cors__AllowedOrigins` değişkeni virgülle ayrılmış bir liste olarak da verilebilir.

Development ortamında CORS otomatik olarak `http://localhost:4200` için açılır. Production ortamında frontend origin'leri env var veya secret store üzerinden verilmelidir.

Writer OTP akışı development ortamında SMTP ayarı yoksa debug code'u API response içinde döndürür ve backend log'una yazar. Production ortamında mail ayarları zorunludur.

## Konfigürasyon Stratejisi

- `backend/Turkisheco.Api/appsettings.json`: yalnızca secretsız ortak ayarlar
- `backend/Turkisheco.Api/appsettings.Production.json`: secretsız production varsayılanları
- `backend/Turkisheco.Api/appsettings.Example.json`: beklenen config şablonu

Gerçek connection string, JWT key ve production origin'leri repoya commit edilmemelidir.
