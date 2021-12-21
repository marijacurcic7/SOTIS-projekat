edges = [(1, 2), (1, 3), (1, 4), (2, 3), (2, 4), (3, 4)]
nodes = list(set([node for pair in edges for node in pair]))
print(edges)
for x in nodes:
  for y in nodes:
    for z in nodes:
        if (x, y) in edges and (y, z) in edges:
                if (x, z) == (1,4):
                    try: edges.remove((x, z))
                    except: pass
print(edges)
