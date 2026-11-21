# Como instalar o recebimento de currículos (Google Apps Script)

Feito **uma única vez**, na conta Google do escritório (soaresporath.adv@gmail.com). Leva cerca de 10 minutos.

1. Entre em **https://script.google.com** com a conta **soaresporath.adv@gmail.com**.
2. Clique em **Novo projeto**.
3. Clique em "Projeto sem título" (no alto) e renomeie para **Currículos do site**.
4. Apague todo o texto que aparece no editor e **cole o conteúdo do arquivo** `tools/apps-script-curriculos.gs`.
5. Clique no ícone de **disquete (Salvar)**.
6. Na lista no alto do editor, escolha a função **testarEnvio** e clique em **Executar**.
   - O Google vai pedir autorização: **Revisar permissões** → escolha a conta do escritório.
   - Pode aparecer "O Google não verificou este app": clique em **Avançado** → **Acessar Currículos do site (não seguro)**. É normal, porque o script é de vocês mesmos.
   - Clique em **Permitir**.
   - Confira no Gmail se chegou "Teste do formulário de currículos do site".
7. Clique em **Implantar** → **Nova implantação**.
   - Em "Selecionar tipo" (engrenagem), escolha **App da Web**.
   - Descrição: `Currículos do site`.
   - Executar como: **Eu (soaresporath.adv@gmail.com)**.
   - Quem pode acessar: **Qualquer pessoa**.
   - Clique em **Implantar**.
8. Copie a **URL do app da Web** (começa com `https://script.google.com/macros/s/...` e termina com `/exec`) e envie para o Claude, que coloca no site.

## Observações
- "Qualquer pessoa" significa que o **formulário do site** pode enviar para o script. Ninguém consegue ver os currículos: eles só chegam ao e-mail do escritório.
- Limite do Google para contas gratuitas: cerca de **100 e-mails por dia**, mais que suficiente.
- O script pede apenas a permissão de **enviar e-mails**. Ele não acessa o Drive nem outros dados da conta.
- Se alterar o script, sempre publique uma **nova versão** da implantação para a mudança valer.
