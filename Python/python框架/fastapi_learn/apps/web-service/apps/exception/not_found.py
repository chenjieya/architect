"""资源不存在异常"""

from apps.exception.base import BusinessException


class NotFoundException(BusinessException):
    """资源不存在业务异常"""

    pass
