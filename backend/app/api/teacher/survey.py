from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import os
import uuid
from datetime import datetime
from app.services.survey_service import survey_service

router = APIRouter()

# 模型定义
class QuestionCreate(BaseModel):
    questionType: str
    questionText: str
    questionOrder: int
    score: float
    options: Optional[List[Dict[str, Any]]] = None
    correctAnswer: Optional[Any] = None
    answerExplanation: Optional[str] = None
    referenceFiles: Optional[List[str]] = None
    minWordCount: Optional[int] = None
    gradingCriteria: Optional[Dict[str, Any]] = None

class SurveyCreate(BaseModel):
    title: str
    description: Optional[str] = None
    questions: List[QuestionCreate]

class SurveyInfo(BaseModel):
    id: str
    title: str
    status: str
    responses: int
    total: int

class SurveyResults(BaseModel):
    survey_id: str
    title: str
    total_responses: int
    results: Dict[str, Any]

class SurveyResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    status: str
    created_at: str

@router.get("", response_model=List[SurveyInfo])
async def get_surveys():
    """
    获取教师创建的所有问卷
    """
    # TODO: 从数据库获取问卷列表
    return [
        SurveyInfo(
            id="1",
            title="课程反馈调查",
            status="active",
            responses=45,
            total=128
        ),
        SurveyInfo(
            id="2",
            title="期中测评",
            status="closed",
            responses=120,
            total=128
        )
    ]

@router.post("", response_model=SurveyResponse)
async def create_survey(survey: SurveyCreate):
    """
    创建新问卷（包含题目）
    """
    try:
        # TODO: 从认证信息中获取teacher_id，这里暂时使用模拟值
        teacher_id = "teacher_001"  # 实际应该从JWT token中获取
        
        # 转换题目数据格式
        questions_data = []
        for q in survey.questions:
            questions_data.append({
                'questionType': q.questionType,
                'questionText': q.questionText,
                'questionOrder': q.questionOrder,
                'score': q.score,
                'options': q.options,
                'correctAnswer': q.correctAnswer,
                'answerExplanation': q.answerExplanation,
                'referenceFiles': q.referenceFiles,
                'minWordCount': q.minWordCount,
                'gradingCriteria': q.gradingCriteria,
            })
        
        # 创建问卷
        result = await survey_service.create_survey(
            teacher_id=teacher_id,
            title=survey.title,
            description=survey.description,
            questions=questions_data,
            status='draft'
        )
        
        return SurveyResponse(
            id=result['id'],
            title=result['title'],
            description=result['description'],
            status=result['status'],
            created_at=result['created_at']
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建问卷失败: {str(e)}")

@router.post("/{survey_id}/publish")
async def publish_survey(survey_id: str):
    """
    发布问卷
    """
    try:
        result = await survey_service.publish_survey(survey_id)
        return {
            "code": 200,
            "message": "问卷发布成功",
            "data": {
                "id": result['id'],
                "status": result['status'],
                "published_at": result.get('published_at')
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"发布问卷失败: {str(e)}")

@router.post("/{survey_id}/unpublish")
async def unpublish_survey(survey_id: str):
    """
    取消发布问卷
    """
    try:
        result = await survey_service.unpublish_survey(survey_id)
        return {
            "code": 200,
            "message": "取消发布成功",
            "data": result
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"取消发布失败: {str(e)}")

@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """
    上传文件（用于问答题参考材料）
    """
    try:
        # 创建上传目录
        upload_dir = "uploads"
        os.makedirs(upload_dir, exist_ok=True)
        
        # 生成唯一文件名
        file_ext = os.path.splitext(file.filename)[1]
        file_id = str(uuid.uuid4())
        filename = f"{file_id}{file_ext}"
        file_path = os.path.join(upload_dir, filename)
        
        # 保存文件
        with open(file_path, "wb") as f:
            content = await file.read()
            f.write(content)
        
        # 返回文件URL（实际应该返回完整的URL）
        file_url = f"/uploads/{filename}"
        
        return {
            "code": 200,
            "message": "文件上传成功",
            "data": {
                "url": file_url,
                "filename": file.filename,
                "size": len(content)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"文件上传失败: {str(e)}")

@router.get("/{survey_id}/results", response_model=SurveyResults)
async def get_survey_results(survey_id: str):
    """
    获取问卷统计结果
    """
    # TODO: 从数据库统计结果
    return SurveyResults(
        survey_id=survey_id,
        title="课程反馈调查",
        total_responses=45,
        results={
            "q1": {
                "非常满意": 20,
                "满意": 15,
                "一般": 8,
                "不满意": 2
            }
        }
    )
