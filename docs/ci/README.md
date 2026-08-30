# Alur kerja CI

`periksa.yml` menjalankan build, pemeriksaan tipe, lint, test, dan memastikan
`pnpm demo:strip` masih menghasilkan project yang bisa dibangun.

## Mengaktifkan

```bash
mkdir -p .github/workflows
cp docs/ci/periksa.yml .github/workflows/
git add .github && git commit -m "ci: aktifkan alur pemeriksaan" && git push
```

> Berkas ini tidak diletakkan langsung di `.github/workflows/` karena GitHub
> menolak push berkas alur kerja dari token tanpa scope `workflow`. Kalau token
> Anda punya scope itu, pindahkan saja berkasnya dan hapus folder ini.
