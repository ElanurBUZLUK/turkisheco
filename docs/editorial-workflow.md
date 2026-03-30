# Editorial Workflow

## Roller

### `super_admin`

- `api/admin/writers` üzerinden yeni writer oluşturabilir
- `api/posts` üzerinden taslak oluşturabilir veya doğrudan yayımlayabilir
- tüm yazıları görebilir
- review kuyruğunu görebilir
- yazıları onaylayabilir, reddedebilir, yayımlayabilir

### `writer`

- `/w/{username}` + OTP doğrulaması ile giriş yapar
- yalnızca kendi yazılarını görebilir
- taslak kaydedebilir
- kendi yazısını incelemeye gönderebilir
- doğrudan publish edemez

## Route ve Guard'lar

- `/admin/posts`: sadece `super_admin`
- `/posts/new`: `super_admin` veya doğrulanmış `writer`
- `/w/{username}`: writer OTP erişim girişi

## Post Durumları

- `draft`
- `submitted_for_review`
- `approved`
- `published`
- `rejected`

## Akış

1. `super_admin` admin panelinden writer oluşturur.
2. Writer `/w/{username}` adresine gider, mail ile tek kullanımlık kod alır.
3. Kod doğrulanınca writer JWT oturumu açılır.
4. Writer editor ekranında taslak kaydeder ve `submitted_for_review` durumuna yollar.
5. `super_admin` review kuyruğunda yazıyı inceler.
6. `super_admin` yazıyı `approved`, `rejected` veya `published` durumuna geçirir.
7. Public listelerde yalnızca `published` içerikler görünür.
