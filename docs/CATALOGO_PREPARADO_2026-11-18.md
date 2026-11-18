# Catálogo de livros futuros no Lityra (18/11/2026)

## Preparação sem publicação

O catálogo contém todos os **34 volumes** conhecidos no repositório canónico `guyoshi/dimensoesinfinitas`, com identificadores estáveis por série e número, título, ordem e manifesto `data/<id>.json`.

**Manifestos com `chapters: []` são intencionais e não correspondem a capítulos escritos.** Não preencher com texto fictício.

- Livros novos entram com `signupAvailable: false`, fora do ecrã de escolha inicial de novos leitores.
- O **painel de leitores** continua a usar as **mesmas caixas de seleção de acesso por livro**. Estes volumes não foram concedidos a nenhum perfil já existente e não aparecem para leitores sem autorização.
- O administrador pode vê-los para conferir o catálogo ou selecionar manualmente o acesso de um perfil; isso não publica capítulos por si só.
- Para acrescentar um capítulo verdadeiro, escrever no Editor de Livros, guardar o manuscrito canónico e executar `Central-Dimensoes-Infinitas/sincronizar_lityra.py` no fluxo local de sincronização existente. O sincronizador detecta automaticamente todos os diretórios com `00 - Texto/livro.json`, inclusive os futuros: não é necessário criar novamente a ficha nem o manifesto.
- Não renomear os IDs ao mudar títulos; histórico de leitura e autorizações dependem deles.

**Volumes de Édelin Lys:** Promessas do Mar; Memórias do Fogo; Segredos do Gelo.
**Mistério Oculto:** Órbita Oráculo; Fábula de Fogo; Cidade Crepúsculo; Trilhos do Tempo; Destino Disruptivo.
**A União:** A União; Chamas da Noite; Nova Era; Livro 4 (título ainda não encontrado no acervo canónico).
