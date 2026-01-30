from gensim.models import Word2Vec

# 加载模型
model = Word2Vec.load("word2vec.model")

# 获取某个词的词向量
print("词向量(nlp):")
print(model.wv["nlp"])

# 找出最相似的词
print("\n与 'nlp' 最相似的词：")
print(model.wv.most_similar("nlp", topn=3))

# 计算两个词的相似度
print("\n'deep' 和 'learning' 的相似度：")
print(model.wv.similarity("deep", "learning"))