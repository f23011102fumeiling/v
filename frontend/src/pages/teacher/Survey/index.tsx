import { useState } from 'react'
import ManualQuestionForm from '../../../components/ManualQuestionForm'
import { QuestionFormData, SurveyCreateFormData } from '../../types'
import { teacherSurveyApi } from '../../../services'

type CreateMode = 'manual' | 'ai' | 'knowledge' | null
type SurveyStatus = 'draft' | 'published'

interface Survey {
  id: string
  title: string
  description: string
  questionCount: number
  status: SurveyStatus
  createdAt: string
  publishedAt?: string
}

const TeacherSurvey = () => {
  const [createMode, setCreateMode] = useState<CreateMode>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [aiDescription, setAiDescription] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  
  // 手动添加题目相关状态
  const [showManualQuestionModal, setShowManualQuestionModal] = useState(false)
  const [questions, setQuestions] = useState<QuestionFormData[]>([])
  const [surveyTitle, setSurveyTitle] = useState('')
  const [surveyDescription, setSurveyDescription] = useState('')
  const [isPublishing, setIsPublishing] = useState(false)
  
  // 模拟问卷列表
  const [surveys, setSurveys] = useState<Survey[]>([
    {
      id: '1',
      title: '数据结构期中测验',
      description: '栈、队列、树的基础知识',
      questionCount: 20,
      status: 'published',
      createdAt: '2026-01-20',
      publishedAt: '2026-01-21'
    },
    {
      id: '2',
      title: '算法分析问卷',
      description: '时间复杂度与空间复杂度分析',
      questionCount: 15,
      status: 'draft',
      createdAt: '2026-01-25'
    },
  ])

  const creationModes = [
    {
      id: 'manual' as CreateMode,
      title: '手动上传',
      description: '手动添加题目或上传Word文档自动识别',
      icon: '📝',
      color: 'blue',
    },
    {
      id: 'ai' as CreateMode,
      title: 'AI生成',
      description: '给出描述，AI自动生成问卷',
      icon: '🤖',
      color: 'purple',
    },
    {
      id: 'knowledge' as CreateMode,
      title: '基于知识库',
      description: '描述需求，AI基于知识库生成问卷',
      icon: '📚',
      color: 'green',
    },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFile(file)
      alert(`文件已选择: ${file.name}`)
    }
  }

  const handleGenerate = () => {
    if (createMode === 'ai' || createMode === 'knowledge') {
      if (!aiDescription.trim()) {
        alert('请输入描述')
        return
      }
      alert(`正在使用${createMode === 'ai' ? 'AI' : 'AI+知识库'}生成问卷...\n描述: ${aiDescription}`)
    } else if (createMode === 'manual') {
      if (!uploadedFile) {
        alert('请上传文件或手动添加题目')
        return
      }
      alert(`正在处理文件: ${uploadedFile.name}`)
    }
    setShowCreateModal(false)
    setCreateMode(null)
    setAiDescription('')
    setUploadedFile(null)
  }

  const handlePublish = (surveyId: string) => {
    setSurveys(surveys.map(s => 
      s.id === surveyId 
        ? { ...s, status: 'published', publishedAt: new Date().toISOString().split('T')[0] }
        : s
    ))
  }

  const handleUnpublish = (surveyId: string) => {
    setSurveys(surveys.map(s => 
      s.id === surveyId 
        ? { ...s, status: 'draft', publishedAt: undefined }
        : s
    ))
  }

  const handleDelete = (surveyId: string) => {
    if (confirm('确定要删除这个问卷吗？')) {
      setSurveys(surveys.filter(s => s.id !== surveyId))
    }
  }

  return (
    <div className="h-full bg-gray-50">
      {/* 顶部标题 */}
      <div className="bg-white border-b border-gray-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">问卷管理</h2>
            <p className="text-sm text-gray-500 mt-1">创建、编辑和发布问卷</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
          >
            <span>🎯</span>
            <span>出题助手</span>
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* 出题方式选择卡片 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">创建新问卷</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {creationModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => {
                    setCreateMode(mode.id)
                    setShowCreateModal(true)
                  }}
                  className={`bg-white rounded-lg border-2 p-6 cursor-pointer transition-all hover:shadow-lg ${
                    mode.color === 'blue'
                      ? 'border-blue-200 hover:border-blue-400'
                      : mode.color === 'purple'
                      ? 'border-purple-200 hover:border-purple-400'
                      : 'border-green-200 hover:border-green-400'
                  }`}
                >
                  <div className="text-4xl mb-3">{mode.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{mode.title}</h3>
                  <p className="text-sm text-gray-600">{mode.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 问卷列表 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">我的问卷</h3>
            <div className="space-y-4">
              {surveys.map((survey) => (
                <div
                  key={survey.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-xl font-bold text-gray-800">{survey.title}</h4>
                        {survey.status === 'published' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            ✅ 已发布
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                            📝 草稿
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3">{survey.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <span className="flex items-center">
                          <span className="mr-1">📋</span>
                          {survey.questionCount} 道题目
                        </span>
                        <span className="flex items-center">
                          <span className="mr-1">📅</span>
                          创建于 {survey.createdAt}
                        </span>
                        {survey.publishedAt && (
                          <span className="flex items-center">
                            <span className="mr-1">🚀</span>
                            发布于 {survey.publishedAt}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      {survey.status === 'draft' ? (
                        <button
                          onClick={() => handlePublish(survey.id)}
                          className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg text-sm font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg"
                        >
                          🚀 发布问卷
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnpublish(survey.id)}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-all"
                        >
                          📥 取消发布
                        </button>
                      )}
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">
                        ✏️ 编辑
                      </button>
                      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all">
                        📊 查看统计
                      </button>
                      <button
                        onClick={() => handleDelete(survey.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-all"
                      >
                        🗑️ 删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 功能说明 */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="font-semibold text-gray-800 mb-3">💡 出题功能说明</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>手动上传:</strong> 支持手动添加题目或上传Word文档，系统自动识别题目格式</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>AI生成:</strong> 输入题目要求描述，AI智能生成相关试题</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>基于知识库:</strong> 结合课程知识库，生成符合教学大纲的高质量题目</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span><strong>发布管理:</strong> 创建的问卷为草稿状态，点击"发布"后学生才能看到</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* 创建问卷模态框 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">
                  {createMode === 'manual' && '📝 手动创建问卷'}
                  {createMode === 'ai' && '🤖 AI生成问卷'}
                  {createMode === 'knowledge' && '📚 基于知识库生成'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setCreateMode(null)
                    setAiDescription('')
                    setUploadedFile(null)
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {createMode === 'manual' ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      上传Word文档
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
                      <input
                        type="file"
                        accept=".doc,.docx"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <div className="text-4xl mb-2">📄</div>
                        <p className="text-gray-600 mb-1">点击上传或拖拽文件</p>
                        <p className="text-sm text-gray-400">支持 .doc, .docx 格式</p>
                        {uploadedFile && (
                          <p className="mt-2 text-blue-600 font-medium">{uploadedFile.name}</p>
                        )}
                      </label>
                    </div>
                  </div>
                  <div className="text-center text-gray-400">或</div>
                  <button 
                    onClick={() => {
                      setShowCreateModal(false)
                      setShowManualQuestionModal(true)
                    }}
                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    手动添加题目
                  </button>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {createMode === 'ai' ? 'AI生成描述' : '基于知识库生成描述'}
                  </label>
                  <textarea
                    value={aiDescription}
                    onChange={(e) => setAiDescription(e.target.value)}
                    placeholder={
                      createMode === 'ai'
                        ? '例如：生成一份关于数据结构中栈和队列的测验，包含10道选择题和5道简答题...'
                        : '例如：根据知识库中的数据结构课程资料，生成一份涵盖第三章内容的测验...'
                    }
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none min-h-[200px] resize-none"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {createMode === 'knowledge' && '💡 AI将从您上传的课程资料中提取相关知识点'}
                  </p>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateMode(null)
                  setAiDescription('')
                  setUploadedFile(null)
                }}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                取消
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                {createMode === 'manual' ? '开始识别' : '生成问卷'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 手动添加题目模态框 */}
      {showManualQuestionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl z-10">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800">📝 手动创建问卷</h3>
                <button
                  onClick={() => {
                    setShowManualQuestionModal(false)
                    setQuestions([])
                    setSurveyTitle('')
                    setSurveyDescription('')
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* 问卷基本信息 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  问卷标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={surveyTitle}
                  onChange={(e) => setSurveyTitle(e.target.value)}
                  placeholder="请输入问卷标题..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  问卷描述（可选）
                </label>
                <textarea
                  value={surveyDescription}
                  onChange={(e) => setSurveyDescription(e.target.value)}
                  placeholder="请输入问卷描述..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none min-h-[80px] resize-none"
                  rows={3}
                />
              </div>

              {/* 题目列表 */}
              {questions.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-800">
                      已添加题目 ({questions.length})
                    </h4>
                  </div>
                  <div className="space-y-3">
                    {questions.map((q, index) => (
                      <div
                        key={index}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                                题目 {index + 1}
                              </span>
                              <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs">
                                {q.questionType === 'single_choice' ? '选择题' : 
                                 q.questionType === 'fill_blank' ? '填空题' : '问答题'}
                              </span>
                              <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                                {q.score} 分
                              </span>
                            </div>
                            <p className="text-gray-800 font-medium mb-1">{q.questionText}</p>
                            {q.questionType === 'single_choice' && q.options && (
                              <div className="mt-2 space-y-1">
                                {q.options.map((opt) => (
                                  <div key={opt.key} className="text-sm text-gray-600">
                                    {opt.key}. {opt.value}
                                    {opt.isCorrect && (
                                      <span className="ml-2 text-green-600 font-medium">✓ 正确答案</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            )}
                            {q.questionType === 'fill_blank' && q.correctAnswers && (
                              <div className="mt-2 text-sm text-gray-600">
                                答案: {q.correctAnswers.join(', ')}
                              </div>
                            )}
                            {q.questionType === 'essay' && (
                              <div className="mt-2 text-sm text-gray-600">
                                {q.minWordCount && <div>最少字数: {q.minWordCount}</div>}
                                {q.gradingCriteria && (
                                  <div>评分标准: {q.gradingCriteria.scoreDistribution.length} 项</div>
                                )}
                              </div>
                            )}
                          </div>
                          <button
                            onClick={() => {
                              setQuestions(questions.filter((_, i) => i !== index))
                            }}
                            className="ml-4 text-red-500 hover:text-red-700 text-xl font-bold"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 添加题目表单 */}
              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">
                  {questions.length === 0 ? '添加第一道题目' : '添加下一道题目'}
                </h4>
                <ManualQuestionForm
                  onSave={(question) => {
                    setQuestions([...questions, question])
                    // 滚动到底部显示新添加的题目
                    setTimeout(() => {
                      const modal = document.querySelector('.max-h-\\[90vh\\]')
                      if (modal) {
                        modal.scrollTop = modal.scrollHeight
                      }
                    }, 100)
                  }}
                  onCancel={() => {
                    // 重置表单后继续添加题目
                  }}
                />
              </div>
            </div>

            {/* 底部操作栏 */}
            {questions.length > 0 && (
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  共 {questions.length} 道题目，总分 {questions.reduce((sum, q) => sum + q.score, 0)} 分
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowManualQuestionModal(false)
                      setQuestions([])
                      setSurveyTitle('')
                      setSurveyDescription('')
                    }}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium"
                  >
                    取消
                  </button>
                  <button
                    onClick={async () => {
                      if (!surveyTitle.trim()) {
                        alert('请输入问卷标题')
                        return
                      }
                      if (questions.length === 0) {
                        alert('请至少添加一道题目')
                        return
                      }

                      setIsPublishing(true)
                      try {
                        // 准备题目数据
                        const questionsData = await Promise.all(questions.map(async (q, index) => {
                          const questionData: any = {
                            questionType: q.questionType,
                            questionText: q.questionText,
                            questionOrder: index + 1,
                            score: q.score,
                            answerExplanation: q.answerExplanation,
                          }

                          if (q.questionType === 'single_choice' && q.options) {
                            questionData.options = q.options.map(opt => ({
                              key: opt.key,
                              value: opt.value,
                            }))
                            questionData.correctAnswer = q.options.find(opt => opt.isCorrect)?.key
                          }

                          if (q.questionType === 'fill_blank' && q.correctAnswers) {
                            questionData.correctAnswer = q.correctAnswers
                          }

                          if (q.questionType === 'essay') {
                            // 上传文件（如果有）
                            if (q.referenceFiles && q.referenceFiles.length > 0) {
                              const uploadedFileUrls: string[] = []
                              for (const file of q.referenceFiles) {
                                try {
                                  const result = await teacherSurveyApi.uploadFile(file)
                                  const fileUrl = result.data?.url || result.url
                                  if (fileUrl) {
                                    uploadedFileUrls.push(fileUrl)
                                  }
                                } catch (error) {
                                  console.error('文件上传失败:', error)
                                }
                              }
                              questionData.referenceFiles = uploadedFileUrls
                            }
                            questionData.minWordCount = q.minWordCount
                            questionData.gradingCriteria = q.gradingCriteria
                          }

                          return questionData
                        }))

                        // 创建问卷
                        const surveyData: SurveyCreateFormData = {
                          title: surveyTitle.trim(),
                          description: surveyDescription.trim() || undefined,
                          questions: questionsData,
                        }

                        const result = await teacherSurveyApi.createSurvey(surveyData)

                        // 兼容不同返回结构，确保拿到 id
                        const surveyId = result?.id || result?.data?.id || result?.data?.data?.id
                        if (!surveyId) {
                          console.error('createSurvey 返回值:', result)
                          alert('创建问卷未返回 id，发布失败，请检查后端日志')
                          setIsPublishing(false)
                          return
                        }

                        // 发布问卷
                        const publishResult = await teacherSurveyApi.publishSurvey(surveyId)

                        // 将新发布的问卷添加到列表中，确保"我的问卷"立即可见
                        const createdAtRaw = result?.created_at || result?.data?.created_at
                        const publishedAtRaw = publishResult?.data?.published_at || publishResult?.published_at
                        const formatDate = (value?: string) => value ? value.split('T')[0] : new Date().toISOString().split('T')[0]

                        setSurveys((prev) => [
                          {
                            id: surveyId,
                            title: surveyTitle.trim(),
                            description: surveyDescription.trim(),
                            questionCount: questions.length,
                            status: 'published',
                            createdAt: formatDate(createdAtRaw),
                            publishedAt: formatDate(publishedAtRaw),
                          },
                          ...prev,
                        ])

                        alert('问卷发布成功！')
                        setShowManualQuestionModal(false)
                        setQuestions([])
                        setSurveyTitle('')
                        setSurveyDescription('')
                      } catch (error: any) {
                        console.error('发布失败:', error)
                        alert(error.response?.data?.message || '发布失败，请重试')
                      } finally {
                        setIsPublishing(false)
                      }
                    }}
                    disabled={isPublishing}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPublishing ? '发布中...' : '🚀 发布问卷'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherSurvey
