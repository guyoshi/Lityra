# Lityra

**Biblioteca digital e plataforma de leitura do universo Dimensões Infinitas.**

O **Lityra não é um editor de livros**. É o espaço onde os leitores podem descobrir, ler e ouvir os livros de Guilherme S. L. Anjos. A edição do manuscrito, as revisões autorais e o preparo dos conteúdos continuam separados, no repositório canônico `guyoshi/dimensoesinfinitas`, através do **Editor de Livros**.

## O que a plataforma já oferece

- Aplicação web instalável (PWA), com biblioteca de obras independentes de diferentes séries;
- Leitura por capítulos, retomada do ponto de leitura e modo de foco;
- Reprodução de áudios publicados e, quando disponível, leitura sintética pelo navegador;
- Música de fundo opcional e painel administrativo para atualização do conteúdo publicado.

No momento, o catálogo documentado inclui **Ruínas dos Céus** e **Guerras de Sangue**, do **Ciclo de Jesed**. Cada novo livro pode ser adicionado à mesma biblioteca.

## Visão de futuro (funcionalidades planeadas, não necessariamente disponíveis)

A evolução prevista é a de uma **plataforma para leitores e uma futura operação comercial**: leitura e participação de leitores beta, acompanhamento e retorno estruturado de leitura, experiências de áudio e narração ampliadas, além de possíveis funcionalidades de acesso e serviços pagos. Estas são direções de produto, **não compromissos de que os recursos já estejam implementados ou comercializados**.

## Repositório, publicação e fonte canônica

- **Aplicação de leitura:** [`guyoshi/Lityra`](https://github.com/guyoshi/Lityra).
- **Manuscritos originais e Editor de Livros:** `guyoshi/dimensoesinfinitas` (fonte canônica).
- **Publicação dos capítulos:** workflow de sincronização descrito mais abaixo. O painel ADM do Lityra atualiza a cópia publicada, mas não substitui a edição do manuscrito no repositório de origem.
- **Instalação no dispositivo:** quando hospedado, o endereço do Lityra pode ser aberto no navegador e adicionado à tela inicial como PWA. Se for usado GitHub Pages, a publicação é configurada em **Settings → Pages** da branch apropriada.

## Onde colocar o conteúdo de cada livro

Dentro de `content/ruinas-dos-ceus/`:

- `capitulos/` → copie aqui os `.md` de dentro da pasta `00 - Texto/capitulos`
  do livro, **sem mudar o nome dos arquivos** (o app já espera esses nomes
  exatos, ex. `01 - Capítulo 1 - O Sopro de Etérea.md`).
- `audio/` → coloque aqui o `.wav` do capítulo inteiro que o Editor de
  Livros gera (botão de narração → baixa um `.wav` por capítulo).
  **Recomendo converter pra `.mp3` antes de subir** (arquivo bem menor,
  carrega mais rápido no celular e sem perda perceptível pra voz). Mantenha
  o nome igual ao que o editor gera, só trocando a extensão, ex.:
  `Ruínas dos Céus - Capítulo 1 - O Sopro de Etérea.mp3`.

Você não precisa ter todos os 25 capítulos com áudio pra usar o app — os
que ainda não tiverem `.mp3` podem ser ouvidos usando a voz do próprio
celular ou navegador (Web Speech API), sem cadastro nem cobrança de API.
Nesses capítulos o mesmo botão de áudio ativa a leitura sintética, com
seleção de voz em português (prioridade pt-BR), velocidade entre 0,75× e
1,5×, retomada por trecho, avanço pela barra e recuo. A posição da voz
sintética é guardada neste aparelho; não confundir com a posição dos MP3
que já têm seu comportamento e sincronização originais.

A qualidade da voz depende das opções instaladas no sistema e não equivale
necessariamente a um audiobook profissional. Alguns navegadores interrompem
a voz com a tela bloqueada ou em segundo plano; para reprodução mais estável
continue oferecendo MP3. O Lityra nunca substitui um MP3 por TTS quando ele
está disponível.
Suba aos poucos, o app detecta sozinho quais já existem.

### Conversão rápida wav → mp3

Se tiver o `ffmpeg` instalado no PC (gratuito), um comando simples resolve
um arquivo:

```
ffmpeg -i "Ruínas dos Céus - Capítulo 1 - O Sopro de Etérea.wav" -codec:a libmp3lame -b:a 96k "Ruínas dos Céus - Capítulo 1 - O Sopro de Etérea.mp3"
```

(96kbps já fica ótimo pra voz falada e deixa o arquivo bem leve.) Se
preferir, também dá pra converter vários de uma vez com uma ferramenta
gráfica (ex. o próprio VLC tem opção de "Convert").

## Adicionando mais livros depois

Vale pra qualquer livro novo, seja outro livro do Ciclo de Jesed ou de uma
história completamente diferente — o app não é amarrado a nenhuma série:

1. Crie uma pasta nova em `content/`, ex. `content/nome-do-livro/`, com as
   mesmas subpastas `capitulos/` e `audio/`.
2. Crie `data/nome-do-livro.json` (mesmo formato de
   `data/ruinas-dos-ceus.json`) com os títulos/nomes de arquivo dos
   capítulos desse livro.
3. Acrescente uma entrada nova em `data/books.json`, apontando pro
   manifesto novo — o `subtitle` de cada livro é livre (pode citar a série
   dele, ou nada, se for avulso).

Se quiser, é só me avisar quando estiver pronto que eu gero o `.json` do
próximo livro igual fiz com o 1, a partir dos nomes de arquivo reais.

## Música de fundo (opcional)

Se você colocar um arquivo em `content/_shared/ambient.mp3`, o botão de
nota musical na barra do player liga essa música em volume baixo por baixo
da narração. Se esse arquivo não existir, o botão simplesmente não faz
nada — não precisa mexer em código pra ativar/desativar essa função.

## Se quiser trocar de onde o app puxa o conteúdo

Por padrão o app lê tudo deste mesmo site (mesma pasta que você subiu).
Se um dia quiser manter o conteúdo em outro repositório (por exemplo, um
privado, separado do app), dá pra apontar pra lá: no app, toque no ícone
de engrenagem (⚙) e cole o endereço base, por exemplo:

```
https://raw.githubusercontent.com/SEU-USUARIO/OUTRO-REPO/main/
```


## Acesso administrativo seguro

O modo admin usa Firebase Authentication com e-mail/senha e uma allowlist por UID no Firestore. Não existe senha de administrador embutida no repositório.

Configuração inicial, feita uma única vez:

1. No Firebase Console do projeto `editorlivroapeditorlivroappp`, habilite **Authentication → E-mail/Senha**.
2. Em **Authentication → Users**, crie a conta do administrador e copie o **UID**.
3. Em **Firestore Database**, crie a coleção `admins` e um documento cujo ID seja exatamente esse UID. O documento pode conter apenas `enabled: true`; a existência do documento já autoriza o acesso.
4. Publique as regras de `firestore.rules` no Firestore.
5. No app, abra **Ajustes → Modo admin** e entre com o e-mail e a senha dessa conta.

O login tem recuperação de senha por e-mail. Uma conta autenticada que não possua o documento `admins/{UID}` é desconectada e não recebe acesso ao painel.


## Sincronização automática e manual dos manuscritos

**Fonte canônica:** `guyoshi/dimensoesinfinitas`, arquivos `00 - Texto/capitulos/*.md` de cada livro. Este repositório chama-se **`guyoshi/Lityra`** e é o espelho público da leitura. O nome antigo `editorlivroapp` não deve mais ser usado como endereço GitHub.

- **Automática:** qualquer push na branch `main` que altere um arquivo em `**/00 - Texto/**` inicia o workflow [Sync canonical manuscripts to Lityra](https://github.com/guyoshi/dimensoesinfinitas/actions/workflows/sync-beta-reader.yml). Esse workflow publica todos os capítulos canônicos, manifestos, catálogo e capas no Lityra.
- **Publicação manual:** no mesmo workflow do GitHub Actions, clicar **Run workflow** → branch **main** → **Run workflow**. É necessária autenticação GitHub com permissão de executar Actions.
- **Atualização no dispositivo:** no Lityra, entrar no **Painel ADM → Sincronizar conteúdo → Atualizar conteúdo publicado**. O botão busca a versão já publicada, confere os manifestos e renova cache da biblioteca e das imagens. **Não** dispara o GitHub Actions nem sincroniza manuscritos privados sozinho. Há um link direto para a publicação manual na mesma página do painel.
- **Token para publicação:** no repositório de origem, configurar secret `LITYRA_SYNC_TOKEN` com permissão `Contents: Read and write` ao repositório `guyoshi/Lityra`. Por compatibilidade, o workflow continua a aceitar `EDITORLIVROAPP_SYNC_TOKEN` quando o novo não existir.

**Importante:** o identificador de projeto Firebase legado `editorlivroapeditorlivroappp` faz parte das configurações existentes de autenticação e Firestore. A troca de nome do repositório **não** exige renomear nem apagar esse projeto, pois isso quebraria o acesso administrativo e os comentários.
