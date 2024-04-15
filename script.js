"use strict";

{
  // 会話のシナリオ これに対するユーザーの返答は配列に格納される
  const scenarios = {
    1 : {
      name : 'ChatGPTプロンプト作成フレームワーク',
      scenario : [
        'ChatGPTに使えるプロンプトの作成をお手伝いします。\n質問に1つずつ答えてください。\n\n=======================\n#役割\nChatGPTに担ってほしい役割を教えてください。\n\n【例】\nあなたはプロの広告ライターです。\n\n',
        '#インプット\nChatGPTがこれからあなたに与えられるタスクに取り組むにあたって、知っておくべき前提情報を教えてください。\n\n【例】\n・売りたい商品\n思考整理チャットボットくん\n\n・商品の特徴\n思考整理のためのフレームワークに従って、ユーザーに質問をするチャットボットです。\n対話形式で1つずつ質問がされるので、ユーザーは全体の整合性にこだわり過ぎずに、フレームワークに従って思考をアウトプットすることに集中できます。\n\n・制約\n商品紹介文は、フォーマルな文体で書いてください。\n商品紹介文は300文字以内にしてください。\n\n',
        '#命令\nChatGPTにやってほしいタスクを教えてください。\n\n【例】\n(#インプット)の情報と制約に従って、商品紹介文を書いてください。\n\n',
        '#アウトプット\nChatGPTに出力してほしい回答の形式を教えてください。\n\n【例】\nプレーンテキストで出力してください。\n',
      ],
      output : [
        'お疲れ様でした。以下があなたのプロンプトです。\nコピペしてChatGPTの指示にお使いください。\n\n=======================\n#役割\n',
        '\n#インプット\n',
        '\n#命令\n',
        '\n#アウトプット\n',
      ]
    },
    2 : {
      name : 'KPT振り返りフレームワーク',
      scenario : [
        '仕事やプロジェクトが完了したら、KPT(=Keep, Problem, Try)フレームワークに基づいて、振り返りをしましょう。\n今回完了した仕事やプロジェクトに関して、質問に1つずつ答えてください。\n\n=======================\n#Keep\nよかったこと、次回も継続してやりたいことを教えてください。',
        '#Problem\nよくなかったこと、次回は改善すべきことを教えてください。',
        '#Try\n次回に挑戦すること、具体的な改善策を教えてください。'
      ],
      output : [
        'お疲れ様でした。\n以下がKPTフレームワークに基づいて書き出された振り返りです。\n\n=======================\n#Keep\n',
        '\n#Problem\n',
        '\n#Try\n'
      ],
    },
    3 : {
      name : '目標設定フレームワーク',
      scenario: [
        '新しい目標を設定する際は、以下の質問に答えることで、より明確で達成可能な目標を立てることができます。質問に1つずつ答えてください。\n\n#目標\n達成したい目標を具体的に述べてください。',
        '#理由\nその目標を達成したい理由は何ですか?',
        '#期限\nいつまでにその目標を達成したいですか?',
        '#行動計画\nその目標を達成するために、具体的にどのような行動をしますか?',
        '#障壁\nその目標の達成を妨げると予想される障壁は何ですか?',
        '#対策\n予想される障壁に対して、どのような対策を立てますか?' 
      ],
      output: [
        'お疲れ様でした。\n以下が目標設定のためのフレームワークに基づいた内容になります。\n\n=======================\n#目標\n',
        '\n#理由\n',
        '\n#期限\n',
        '\n#行動計画\n',
        '\n#障壁\n',
        '\n#対策\n'
      ]
    }
  };

  // シナリオ選び用スクリプト
  const introScenario = [
    'あなたの思考整理を手伝うチャットボットです。\n取り組みたいフレームワークを選んで、番号を教えてください。\n(JavaScriptを用いて利用者側で処理を行っているため、入力内容は開発者からは見えません。ご安心ください。)\n\n'
  ];
  const introScenarioError = '正しい番号が入力されませんでした。';

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

  // シナリオを選ばせて実行する関数
  async function chooseScenario(scenarioDict, botScript) {
    // シナリオのリストを作成
    let showScenario = '';
    Object.keys(scenarioDict).forEach ((key) => {
      showScenario += `${key} : ${scenarios[key]['name']}\n`;
    });
    // シナリオリストを表示
    setTimeout(function() {
      let introBubble = '';
      for (let i = 0; i < botScript.length; i++) {
        introBubble = botScript[i];
      }
      renderChat(introBubble + showScenario, 'chatBubble');
    }, 1000);
    // ユーザー入力の取得
    const userInput = await getUserInput();
    renderChat(userInput, 'userBubble');
    form.querySelector('.textBox').value = '';
    // ユーザー入力のチェック
    let userInputValid = 0;
    Object.keys(scenarioDict).forEach ((key) => {
      if (userInput === key) {
        userInputValid++;
      }
    });
    // シナリオの実行
    if (userInputValid !== 0) {
      const result = [];
      await scenario(scenarioDict[userInput]['scenario'], scenarioDict[userInput]['output'], result);
      setTimeout(function() { // シナリオの実行後、シナリオ選択に戻る
        chooseScenario(scenarioDict, botScript);
      }, 2000);
    } else {
      setTimeout(function() {
        renderChat(introScenarioError, 'chatBubble'); //不正な入力があった場合はシナリオ選択に戻る
        chooseScenario(scenarioDict, botScript);
      }, 1000);
    }
    
  }

  // 関数の実行
  chooseScenario(scenarios, introScenario);

}


