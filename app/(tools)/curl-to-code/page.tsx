/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { ToolPanel } from '@/app/components/ToolPanel'
import { 
  parseCurl, 
  generateCode, 
  sampleCurlCommands,
  type CurlToCodeOptions 
} from '@/app/lib/tools/js/curl-to-code'
import { useToast } from '@zyther/react-toastify'

export default function CurlToCode() {
  const [input, setInput] = useState('')
  const toast = useToast()
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<CurlToCodeOptions['language']>('javascript')
  const [parsedOptions, setParsedOptions] = useState<CurlToCodeOptions | null>(null)
  const [inputChars, setInputChars] = useState(0)
  const [outputChars, setOutputChars] = useState(0)

  const handleConvert = () => {
    if (!input.trim()) {
      toast.error('Please paste a cURL command')
      return
    }

    const parsed = parseCurl(input)
    if (!parsed) {
      toast.error('Invalid cURL command')
      return
    }

    setParsedOptions(parsed)
    
    const code = generateCode({ ...parsed, language })
    setOutput(code)
    toast.success('cURL converted to code!')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setParsedOptions(null)
    setInputChars(0)
    setOutputChars(0)
    toast.success('Cleared!')
  }

  const handleCopy = async () => {
    if (!output) {
      toast.error('Nothing to copy')
      return
    }
    try {
      await navigator.clipboard.writeText(output)
      toast.success('Copied to clipboard!')
    } catch (error) {
      console.log(error)
      toast.error('Failed to copy')
    }
  }

  const loadSample = (index: number) => {
    setInput(sampleCurlCommands[index].command)
    setOutput('')
    setParsedOptions(null)
    toast.success('Sample loaded!')
  }

  // Auto-convert when language changes
  useEffect(() => {
    if (parsedOptions) {
      const code = generateCode({ ...parsedOptions, language })
      setOutput(code)
    }
  }, [language, parsedOptions])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleConvert()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [input, language])

  useEffect(() => {
    setInputChars(input.length)
  }, [input])

  useEffect(() => {
    setOutputChars(output.length)
  }, [output])

  const languages: { value: CurlToCodeOptions['language']; label: string; icon: string }[] = [
    { value: 'javascript', label: 'JavaScript (fetch)', icon: 'fa-brands fa-js' },
    { value: 'python', label: 'Python (requests)', icon: 'fa-brands fa-python' },
    { value: 'php', label: 'PHP (cURL)', icon: 'fa-brands fa-php' },
    { value: 'go', label: 'Go', icon: 'fa-brands fa-golang' },
    { value: 'ruby', label: 'Ruby', icon: 'fa-brands fa-ruby' },
    { value: 'java', label: 'Java', icon: 'fa-brands fa-java' },
    { value: 'csharp', label: 'C# (.NET)', icon: 'fa-solid fa-code' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
          <i className="fa-solid fa-terminal text-secondary"></i>
          cURL to Code
        </h1>
        <p className="text-secondary mt-2 max-w-2xl">
          Convert cURL commands to code in JavaScript, Python, PHP, Go, Ruby, Java, and C#.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-terminal text-secondary"></i>
              cURL Command
              <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">cURL</span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{inputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input border border-border rounded-lg p-4 text-primary min-h-50 font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-border-focus"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            placeholder="curl https://api.example.com/data"
          />
          
          <div className="mt-3">
            <span className="text-sm text-secondary">Samples:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {sampleCurlCommands.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSample(index)}
                  className="px-3 py-1 text-xs border border-border rounded hover:bg-hover transition"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={handleConvert}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
            >
              <i className="fas fa-exchange-alt"></i> Convert
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 border border-border rounded-lg hover:bg-hover transition flex items-center gap-2"
            >
              <i className="fas fa-eraser"></i> Clear
            </button>
          </div>
        </ToolPanel>

        <ToolPanel>
          <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
            <label className="font-medium flex items-center gap-2">
              <i className="fas fa-file-code text-green-500"></i>
              Generated Code
              <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                {language.toUpperCase()}
              </span>
            </label>
            <div className="text-sm text-secondary bg-input px-3 py-1 rounded-full border border-border">
              <i className="fas fa-characters"></i> chars <span className="font-semibold text-primary">{outputChars}</span>
            </div>
          </div>
          <textarea
            className="w-full bg-input-readonly border border-border rounded-lg p-4 text-primary min-h-50 font-mono text-sm resize-y focus:outline-none"
            value={output}
            readOnly
            spellCheck={false}
            placeholder="Generated code will appear here…"
          />

          <div className="mt-3">
            <label className="text-sm text-secondary block mb-1">Target Language</label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.value}
                  onClick={() => setLanguage(lang.value)}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition flex items-center gap-2
                    ${language === lang.value
                      ? 'bg-primary text-white'
                      : 'bg-input border border-border hover:bg-hover'
                    }
                  `}
                >
                  <i className={lang.icon}></i>
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition flex items-center gap-2"
          >
            <i className="fas fa-copy"></i> Copy
          </button>
        </ToolPanel>
      </div>

      {parsedOptions && (
        <div className="mt-6 p-4 bg-card border border-border rounded-lg">
          <h3 className="font-semibold mb-2 text-primary flex items-center gap-2">
            <i className="fas fa-info-circle text-blue-500"></i>
            Parsed Information
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-secondary">Method</span>
              <p className="font-semibold text-primary">{parsedOptions.method}</p>
            </div>
            <div>
              <span className="text-secondary">URL</span>
              <p className="font-mono text-primary text-xs truncate">{parsedOptions.url}</p>
            </div>
            <div>
              <span className="text-secondary">Headers</span>
              <p className="font-semibold text-primary">{Object.keys(parsedOptions.headers).length}</p>
            </div>
            <div>
              <span className="text-secondary">Auth</span>
              <p className="font-semibold text-primary">
                {parsedOptions.bearerToken ? 'Bearer Token' : 
                 parsedOptions.auth ? 'Basic Auth' : 
                 'None'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 p-4 bg-card border border-border rounded-lg">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <i className="fas fa-lightbulb text-yellow-500"></i>
          Quick Tips
        </h3>
        <ul className="text-sm text-secondary space-y-1">
          <li>• Press <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Ctrl</kbd> + <kbd className="px-2 py-0.5 bg-input border border-border rounded text-xs">Enter</kbd> to convert quickly</li>
          <li>• Supports <strong>-X</strong> (method), <strong>-H</strong> (headers), <strong>-d</strong> (data)</li>
          <li>• Supports <strong>-u</strong> (basic auth) and <strong>Authorization: Bearer</strong></li>
          <li>• All processing happens in your browser</li>
        </ul>
      </div>
    </div>
  )
}