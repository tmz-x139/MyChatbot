"use strict";

{
  // 会話のシナリオ これに対するユーザーの返答は配列に格納される
  const promptPlanner = [
    'ChatGPTに使えるプロンプトの作成をお手伝いします。\n質問に1つずつ答えてください。\n(JavaScriptを使って利用者側で処理をしているので、\n開発者から入力内容は見えません。ご安心ください。)\n\n=======================\n#役割\nChatGPTに担ってほしい役割を教えてください。\n\n【例】\nあなたはプロの広告ライターです。\n\n',
    '#インプット\nChatGPTがこれからあなたに与えられるタスクに取り組むにあたって、知っておくべき前提情報を教えてください。\n\n【例】\n・売りたい商品\n思考整理チャットボットくん\n\n・商品の特徴\n思考整理のためのフレームワークに従って、ユーザーに質問をするチャットボットです。\n対話形式で1つずつ質問がされるので、ユーザーは全体の整合性にこだわり過ぎずに、フレームワークに従って思考をアウトプットすることに集中できます。\n\n・制約\n商品紹介文は、フォーマルな文体で書いてください。\n商品紹介文は300文字以内にしてください。\n\n',
    '#命令\nChatGPTにやってほしいタスクを教えてください。\n\n【例】\n(#インプット)の情報と制約に従って、商品紹介文を書いてください。\n\n',
    '#アウトプット\nChatGPTに出力してほしい回答の形式を教えてください。\n\n【例】\nプレーンテキストで出力してください。\n',
  ];

  // 会話終了後にユーザーの返答を整形して表示するためのシナリオ
  const promptOutput = [
    'お疲れ様でした。以下があなたのプロンプトです。\nコピペしてChatGPTの指示にお使いください。\n\n=======================\n#役割\n',
    '\n#インプット\n',
    '\n#命令\n',
    '\n#アウトプット\n',
  ]    

  const form = document.querySelector('form'); //form selector
  const chatArea = document.querySelector('ul'); //ul selector

  // Ctrl + Enterでフォーム送信 .submit()はsubmitイベントをトリガーしないのでボタンをクリックしたことにする
  form.addEventListener('keydown', function(e) {
    if (e.ctrlKey) {
      if (e.key === 'Enter') {
        e.preventDefault();
        form.querySelector('button').click();
      }
    }
  });

  // ユーザーの入力をpromiseで取得する
  function getUserInput() {
    return new Promise((resolve) => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (form.querySelector('.textBox').value !== '') {
          const data = form.querySelector('.textBox');
          resolve(data.value);
        }
      });
    });
  }

  // チャットボックスに入力内容を表示
  function renderChat(chat, classname) {
    let chatLi = document.createElement('li'); //li要素を作成
    let chatDiv = document.createElement('div'); //div要素を作成

    chatDiv.textContent = chat; //chatの内容をdiv要素の値に

    chatLi.appendChild(chatDiv); //div要素をli要素の子要素に

    chatLi.classList.add(classname); //classnameをクラス名としてli要素に指定

    chatArea.appendChild(chatLi); //chatAreaに子要素としてli要素を追加

    chatLi.scrollIntoView({ behavior: 'smooth' });//追加したli要素が見えるところまでスクロール
  }

  // 会話シナリオ(botScript)の要素を1つ表示した後、以降はユーザーからの入力があるごとに要素を表示
  // ユーザーからの返答はresultに格納　最後にユーザーの返答を整形して表示するためのシナリオ(botOutput)を使ってユーザーの入力内容を整形して表示
  async function scenario(botScript, botOutput, result) {
    for (let i = 0; i < botScript.length; i++) {
      setTimeout(function() {
        renderChat(botScript[i], 'chatBubble');
      }, 1000);
      const userInput = await getUserInput();
      renderChat(userInput, 'userBubble');
      result.push(userInput);
      form.querySelector('.textBox').value = '';
    }
    setTimeout(function() { //1つの吹き出しで表示したいので文字列を結合していく
      let finalOutput = '';
      for (let i = 0; i < botOutput.length; i++) {
        finalOutput = finalOutput + botOutput[i];
        finalOutput = finalOutput + result[i] + '\n';
      }
      renderChat(finalOutput, 'chatBubble');
    }, 1000);  
  }

  // result用の空配列作成と関数の実行
  const userInputs = [];
  scenario(promptPlanner, promptOutput, userInputs);

}


