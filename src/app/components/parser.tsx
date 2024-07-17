"use client";

import * as Babel from "@babel/standalone";
import * as monaco from "monaco-editor";
import dynamic from "next/dynamic";
import React, { useEffect, useState, useCallback } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), {
  ssr: false,
});

const CodeInput: React.FC<{
  code: string;
  setCode: (code: string) => void;
}> = ({ code, setCode }) => {
  const handleEditorDidMount = useCallback(
    (
      editor: monaco.editor.IStandaloneCodeEditor,
      monacoInstance: typeof monaco
    ) => {
      editor.addCommand(
        monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS,
        () => {
          const formattedCode = editor.getValue();
          editor.setValue(formattedCode);
          setCode(formattedCode);
        }
      );

      monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(
        {
          jsx: monacoInstance.languages.typescript.JsxEmit.React,
          jsxFactory: "React.createElement",
          reactNamespace: "React",
          allowNonTsExtensions: true,
          allowJs: true,
          target: monacoInstance.languages.typescript.ScriptTarget.Latest,
        }
      );

      monacoInstance.editor.setModelLanguage(editor.getModel()!, "typescript");
    },
    [setCode]
  );

  return (
    <div className="w-1/2 h-screen p-4 bg-gray-900">
      <h2 className="text-2xl font-bold mb-4 text-white">Code Input</h2>
      <div className="h-[calc(100%-3rem)] rounded-lg overflow-hidden">
        <MonacoEditor
          height="100%"
          defaultLanguage="typescript"
          defaultValue={code}
          onChange={(value) => setCode(value || "")}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            automaticLayout: true,
          }}
          theme="vs-dark"
        />
      </div>
    </div>
  );
};

const ParsedView: React.FC<{ code: string }> = ({ code }) => {
  const [renderedComponent, setRenderedComponent] =
    useState<React.ReactNode | null>(null);

  useEffect(() => {
    const renderComponent = async () => {
      try {
        const transpiledCode = Babel.transform(code, {
          presets: ["react", "typescript"],
          filename: "component.tsx",
        }).code;
        const ComponentFunction = new Function(
          "React",
          `
            const { useState, useEffect } = React;
            ${transpiledCode}
            return Component;
          `
        );
        const Component = ComponentFunction(React);

        if (typeof Component !== "function") {
          throw new Error("No valid React component found in the code.");
        }

        setRenderedComponent(React.createElement(Component));
      } catch (error) {
        console.error("Error rendering component:", error);
        setRenderedComponent(
          <pre className="text-red-500">{(error as Error).message}</pre>
        );
      }
    };

    renderComponent();
  }, [code]);

  return (
    <div className="w-1/2 h-screen p-4 bg-gray-100 dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-white">
        Preview
      </h2>
      <div className="w-full h-[calc(100%-3rem)] rounded-lg shadow-lg overflow-auto bg-white dark:bg-gray-700">
        {renderedComponent}
      </div>
    </div>
  );
};

const defaultCode = `function Component() {
  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-gray-50 py-6 sm:py-12">
      <div className="relative bg-white px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-lg sm:rounded-lg sm:px-10">
        <div className="mx-auto max-w-md">
          <h1 className="text-3xl font-bold mb-4 text-center">Invoice</h1>
          <div className="mb-6">
            <p className="text-sm text-gray-600">Invoice #: INV-2023-001</p>
            <p className="text-sm text-gray-600">Date: May 15, 2023</p>
          </div>
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Bill To:</h2>
            <p className="text-sm">John Doe</p>
            <p className="text-sm">123 Main St</p>
            <p className="text-sm">Anytown, ST 12345</p>
            <p className="text-sm">johndoe@example.com</p>
          </div>
          <div className="divide-y divide-gray-300/50">
            <div className="space-y-6 py-8 text-base leading-7 text-gray-600">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Description</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2">Web Design Services</td>
                    <td className="text-right">1</td>
                    <td className="text-right">$1,000.00</td>
                    <td className="text-right">$1,000.00</td>
                  </tr>
                  <tr>
                    <td className="py-2">Logo Design</td>
                    <td className="text-right">1</td>
                    <td className="text-right">$500.00</td>
                    <td className="text-right">$500.00</td>
                  </tr>
                  <tr>
                    <td className="py-2">Hosting (12 months)</td>
                    <td className="text-right">12</td>
                    <td className="text-right">$20.00</td>
                    <td className="text-right">$240.00</td>
                  </tr>
                </tbody>
              </table>
              <div className="pt-4 border-t border-gray-300">
                <p className="flex justify-between">
                  <span className="font-semibold">Subtotal:</span>
                  <span>$1,740.00</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-semibold">Tax (10%):</span>
                  <span>$174.00</span>
                </p>
                <p className="flex justify-between text-lg font-bold mt-2">
                  <span>Total:</span>
                  <span>$1,914.00</span>
                </p>
              </div>
            </div>
            <div className="pt-8 text-base font-semibold leading-7">
              <p className="text-gray-900 mb-2">Payment Terms: Due within 30 days</p>
              <p className="text-sm text-gray-600 mb-4">Please make checks payable to: Your Company Name</p>
              <p className="text-gray-900">Questions about this invoice?</p>
              <p>
                <a href="#" className="text-blue-500 hover:text-blue-600">Contact our billing department &rarr;</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`;

const Parser: React.FC = () => {
  const [code, setCode] = useState(defaultCode);

  return (
    <div className="flex h-screen bg-gray-800">
      <CodeInput code={code} setCode={setCode} />
      <ParsedView code={code} />
    </div>
  );
};

export default Parser;
