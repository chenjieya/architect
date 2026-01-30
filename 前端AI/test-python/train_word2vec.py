from gensim.models import Word2Vec

# 示例语料
sentences = [
    ["i", "love", "deep", "learning"],
    ["i", "love", "nlp"],
    ["deep", "learning", "is", "fun"],
    ["nlp", "is", "a", "part", "of", "ai"],
    ["word2vec", "is", "a", "powerful", "embedding"]
]

# 训练模型
model = Word2Vec(sentences, vector_size=100, window=2, min_count=1, sg=1)

# 保存模型
model.save("word2vec.model")
print("模型训练完成并已保存。")