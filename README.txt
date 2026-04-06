BET IN GAMER + Netlify Functions

Arquivos:
- index.html
- netlify/functions/get-status.mjs
- netlify/functions/toggle-status.mjs
- netlify/functions/submit-lead.mjs
- netlify/functions/export-leads.mjs
- package.json
- netlify.toml

Como publicar:
1. Envie esta pasta para um repositório Git e conecte no Netlify.
2. No Netlify, confirme que Functions está habilitado.
3. Opcional: em Site configuration > Environment variables, crie:
   - ADMIN_USER
   - ADMIN_PASS
   Se não criar, o padrão será admin / 1234.

O que faz:
- bloqueio global real para todos os visitantes
- salvar cadastro no Netlify Blobs
- baixar CSV no painel admin
