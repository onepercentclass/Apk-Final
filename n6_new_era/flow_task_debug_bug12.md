# DEBUG bug12 — Contract test mengasumsikan token owner

1. Gejala: cek 3-10 mengharapkan HTTP 200 untuk `/accounts`,
   `/finance/summary`, dan endpoint lain.
2. Dugaan penyebab: skrip tidak memeriksa tier token `N6_TOKEN`.
   Dengan token non-owner (mis. coach), endpoint owner-only menjawab 403
   sehingga skrip melaporkan gagal padahal backend benar.
3. File/baris: `tools/contract-test.sh`, blok cek 3-10.
4. Status verifikasi: confirmed (baca kode).
