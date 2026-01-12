import React, { useState } from 'react';
import beautify from 'js-beautify';

const LANGUAGES = [
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'jsx', label: 'JSX' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'tsx', label: 'TSX' },
];

const INDENT_OPTIONS = [
  { value: 2, label: '2スペース' },
  { value: 4, label: '4スペース' },
  { value: '\t', label: 'タブ' },
];

export default function CodeFormatter() {
  const [inputCode, setInputCode] = useState('');
  const [outputCode, setOutputCode] = useState('');
  const [language, setLanguage] = useState('html');
  const [indentSize, setIndentSize] = useState(2);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('text/')) {
      readFile(file);
    } else if (file) {
      // テキストファイル以外も試す
      readFile(file);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  const readFile = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setInputCode(e.target?.result);
      // ファイル拡張子から言語を推測
      const extension = file.name.split('.').pop()?.toLowerCase();
      const langMap = {
        'html': 'html',
        'htm': 'html',
        'css': 'css',
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'json': 'json',
      };
      if (extension && langMap[extension]) {
        setLanguage(langMap[extension]);
      }
    };
    reader.readAsText(file);
  };

  const formatCode = () => {
    if (!inputCode.trim()) {
      setError('コードを入力してください');
      return;
    }

    try {
      setError('');
      
      const options = {
        indent_size: indentSize === '\t' ? 1 : indentSize,
        indent_char: indentSize === '\t' ? '\t' : ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        keep_array_indentation: false,
        break_chained_methods: false,
        indent_scripts: 'normal',
        brace_style: 'collapse',
        space_before_conditional: true,
        unescape_strings: false,
        jslint_happy: false,
        end_with_newline: true,
        wrap_line_length: 0,
        indent_inner_html: true,
        comma_first: false,
        e4x: true,
        indent_empty_lines: false
      };

      let formatted;
      
      if (language === 'html') {
        formatted = beautify.html(inputCode, options);
      } else if (language === 'css') {
        formatted = beautify.css(inputCode, options);
      } else if (['javascript', 'json', 'jsx', 'typescript', 'tsx'].includes(language)) {
        formatted = beautify.js(inputCode, options);
      } else {
        formatted = beautify.html(inputCode, options);
      }

      setOutputCode(formatted);
    } catch (err) {
      setError(`整形エラー: ${err.message}`);
      setOutputCode('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(outputCode);
    alert('コピーしました！');
  };

  const downloadCode = () => {
    const blob = new Blob([outputCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `formatted.${language}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInputCode('');
    setOutputCode('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">コード整形ツール</h1>
          <p className="text-gray-600">
            HTML、CSS、JavaScriptなどのコードを見やすく整形します。圧縮されたコードやインデントが乱れたコードを綺麗に整えます。
          </p>
        </header>

        {/* 設定エリア */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                言語
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                インデント
              </label>
              <select
                value={indentSize}
                onChange={(e) => {
                  const val = e.target.value;
                  setIndentSize(val === '\t' ? '\t' : parseInt(val));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {INDENT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={formatCode}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
              >
                整形する
              </button>
              <button
                onClick={clearAll}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* コードエリア */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* 入力エリア */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">入力</h2>
              <div className="flex gap-2">
                <input
                  type="file"
                  id="file-input"
                  className="hidden"
                  accept=".html,.htm,.css,.js,.jsx,.ts,.tsx,.json"
                  onChange={handleFileInput}
                />
                <label
                  htmlFor="file-input"
                  className="text-sm text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  ファイルを選択
                </label>
              </div>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-md transition-colors ${
                dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                placeholder="コードを入力するか、ファイルをドラッグ&ドロップ..."
                className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none bg-transparent"
              />
            </div>
          </div>

          {/* 出力エリア */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">出力</h2>
              {outputCode && (
                <div className="flex gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    コピー
                  </button>
                  <button
                    onClick={downloadCode}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    ダウンロード
                  </button>
                </div>
              )}
            </div>
            
            <div className="border border-gray-300 rounded-md bg-gray-50">
              <textarea
                value={outputCode}
                readOnly
                placeholder="整形されたコードがここに表示されます"
                className="w-full h-96 p-4 font-mono text-sm resize-none focus:outline-none bg-transparent"
              />
            </div>
          </div>
        </div>

        {/* 使い方 */}
        <div className="mt-8 bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">使い方</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li>左側の入力エリアにコードを貼り付けるか、ファイルをドラッグ&ドロップ</li>
            <li>言語とインデントサイズを選択</li>
            <li>「整形する」ボタンをクリック</li>
            <li>右側に整形されたコードが表示されます</li>
            <li>「コピー」または「ダウンロード」で結果を保存</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
