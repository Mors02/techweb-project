from django.shortcuts import render
from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.authentication import SessionAuthentication
from .models import Game, GameAttachment, Discount
from .serializers import GameSerializer, GameAttachmentSerializer
from rest_framework.response import Response
from rest_framework import permissions, status, viewsets
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date

class DiscountViewSet(viewsets.ModelViewSet):
    def create(self, request, pk):
        start = parse_date(request.data['discount_start'])
        end = parse_date(request.data['discount_end'])

        if (end < start):
            return Response(status=status.HTTP_400_BAD_REQUEST)

        active_discount = Discount.objects.filter(game_id=pk).filter(end_date__gt=start)

        if active_discount:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        discount = Discount(
            percentage=request.data['discount_percentage'],
            start_date=start,
            end_date=end,
            game_id=pk
        )

        discount.save()
        
        return Response(status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        discount = Discount.objects.get(pk=pk)

        if discount.game.publisher.id == request.user.id:
            discount.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)


class GameViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        if (self.action in ['list', 'retrieve']):
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def list(self, request):
        data = Game.objects.all()
        serializer = GameSerializer(data, many=True)
        return Response(serializer.data)
    
    def retrieve(self, request, pk=None):
        game = get_object_or_404(Game, pk=pk)
        game_serializer = GameSerializer(game)
        
        return Response(game_serializer.data, status=status.HTTP_200_OK)
    
    def create(self, request):
        game = Game(
                title=request.data["title"], 
                description=request.data["description"],
                publisher_id=self.request.user.pk,
                price=request.data["price"],
                image=request.data["image"],
                uploaded_file=request.data["file"]
            )
        game.save()

        attachments = request.FILES.getlist('attachments')
        for attachment in attachments:
            game_attachment = GameAttachment(
                    image=attachment,
                    game_id=game.id
                )
            game_attachment.save()

        if game:
            return Response(status=status.HTTP_201_CREATED)
        return Response(status=status.HTTP_400_BAD_REQUEST)
    
    def update(self, request, pk=None):
        game = get_object_or_404(Game, pk=pk)

        if game.publisher.id != request.user.id:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        game.title = request.data['title']
        game.description = request.data['description']
        game.price = request.data['price']

        if 'image' in request.data:
            game.image = request.data['image']

        if 'file' in request.data:
            game.uploaded_file = request.data['file']

        game.save()

        if 'attachments' in request.FILES:
            attachments = request.FILES.getlist('attachments')
            for attachment in attachments:
                game_attachment = GameAttachment(
                        image=attachment,
                        game_id=game.id
                    )
                game_attachment.save()

        return Response(status=status.HTTP_200_OK)

    def destroy(self, request, pk=None):
        game = Game.objects.get(id=pk)
        if request.user.id == game.publisher.id:
            game.delete()
            return Response(status=status.HTTP_200_OK)
        return Response(status=status.HTTP_401_UNAUTHORIZED)

class YourGameList(generics.ListAPIView):
    serializer_class = GameSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        data = Game.objects.filter(publisher=self.request.user)
        serializer = GameSerializer(data, many=True)
        return Response(serializer.data)
    
class GameAttachmentViewSet(viewsets.ModelViewSet):
    def list(self, request, pk=None):
        data = GameAttachment.objects.filter(game_id=pk)
        serializer = GameAttachmentSerializer(data, many=True)
        return Response(serializer.data)
    
    def destroy(self, request, pk=None):
        attachment = GameAttachment.objects.get(id=pk)

        if attachment.game.publisher.id != request.user.id:
            return Response(status=status.HTTP_401_UNAUTHORIZED)

        attachment.delete()
        return Response(status=status.HTTP_200_OK)